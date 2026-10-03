import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getApiErrorMessage = (error, fallback) => {
    const status = error.response?.status;

    if (status === 400) return "The attendance request is invalid. Check the selected date and worker statuses.";
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You do not have permission to manage attendance for this site.";
    if (status === 404) return "The selected site or attendance record could not be found.";
    if (status === 409) return "Attendance was changed by another request. The latest records are being synchronized.";
    if (status >= 500) return "The server could not process attendance right now. Please try again.";
    if (!error.response) return "Unable to connect to the server. Check your connection and try again.";

    return fallback;
};

const Attendance = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const [sites, setSites] = useState([]);
    const [workers, setWorkers] = useState([]);

    const [selectedSite, setSelectedSite] = useState("");
    const [selectedDate, setSelectedDate] = useState(getLocalDateString);

    const [attendance, setAttendance] = useState({});

    const [existingAttendance, setExistingAttendance] = useState({});

    const [loading, setLoading] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const attendanceRequestId = useRef(0);
    const attendanceController = useRef(null);
    const savingRef = useRef(false);


    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [sitesResponse, workersResponse] =
                    await Promise.all([
                        api.get("/sites", { signal: controller.signal }),
                        api.get("/workers", { signal: controller.signal })
                    ]);

                setSites(sitesResponse.data.sites || []);
                setWorkers(workersResponse.data.workers || []);

            } catch (error) {
                if (error.code === "ERR_CANCELED") return;
                console.error(error);

                setError(getApiErrorMessage(error, "Failed to load attendance data."));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        void fetchData();

        return () => controller.abort();
    }, []);

    const activeSites = sites.filter((site) => site.status === "Active");


    const siteWorkers = workers.filter((worker) => {
        const workerSiteId = worker.siteId?._id || worker.siteId;

        return workerSiteId === selectedSite && worker.status === "Active";
    });


    const fetchExistingAttendance = useCallback(async (siteId = selectedSite, date = selectedDate) => {
        if (!siteId || !date) {
            setAttendance({});
            setExistingAttendance({});
            setLoadingAttendance(false);
            return;
        }

        attendanceController.current?.abort();
        const controller = new AbortController();
        attendanceController.current = controller;
        const requestId = ++attendanceRequestId.current;

        try {
            setLoadingAttendance(true);

            const response = await api.get("/attendance", {
                params: {
                    siteId,
                    startDate: date,
                    endDate: date
                },
                signal: controller.signal
            });

            const records =
                response.data?.attendance ||
                response.data?.records ||
                [];

            const statusMap = {};
            const existingMap = {};

            records.forEach((record) => {
                const workerId = record.workerId?._id || record.workerId;

                if (!workerId || !record._id || !["Present", "Half-Day", "Absent"].includes(record.status)) return;

                statusMap[workerId] = record.status;

                existingMap[workerId] = {
                    id: record._id,
                    status: record.status
                };
            });

            if (requestId === attendanceRequestId.current) {
                setAttendance(statusMap);
                setExistingAttendance(existingMap);
                setError("");
            }

            return { ok: true };

        } catch (error) {
            if (error.code === "ERR_CANCELED" || requestId !== attendanceRequestId.current) {
                return { ok: false, cancelled: true };
            }
            console.error("Fetch existing attendance error:", error);

            setError(getApiErrorMessage(error, "Failed to load existing attendance."));

            setAttendance({});
            setExistingAttendance({});
            return { ok: false };
        } finally {
            if (requestId === attendanceRequestId.current) {
                setLoadingAttendance(false);
                attendanceController.current = null;
            }
        }
    }, [selectedDate, selectedSite]);

    useEffect(() => {
        setAttendance({});
        setExistingAttendance({});
        setError("");

        if (selectedSite && selectedDate) {
            void fetchExistingAttendance(selectedSite, selectedDate);
        } else {
            setLoadingAttendance(false);
        }

        return () => {
            attendanceRequestId.current += 1;
            attendanceController.current?.abort();
        };
    }, [fetchExistingAttendance, selectedDate, selectedSite]);


    const handleAttendanceChange = (
        workerId,
        status
    ) => {
        if (!workerId || !["Present", "Half-Day", "Absent"].includes(status)) return;

        setError("");
        setAttendance((previous) => ({
            ...previous,
            [workerId]: status
        }));
    };


    const markAll = (status) => {
        if (!["Present", "Half-Day", "Absent"].includes(status)) return;

        setError("");
        setAttendance((previous) => {
            const updated = { ...previous };
            siteWorkers.forEach((worker) => {
                if (worker._id) updated[worker._id] = status;
            });
            return updated;
        });
    };


    const handleSaveAttendance = async () => {
        if (savingRef.current) return;

        if (!selectedSite) {
            setError("Please select a site.");
            return;
        }

        if (!selectedDate) {
            setError("Please select an attendance date.");
            return;
        }

        if (selectedDate > getLocalDateString()) {
            setError("Attendance cannot be marked for a future date.");
            return;
        }

        if (siteWorkers.length === 0) {
            setError("No active workers found for this site.");
            return;
        }

        const workersToSave = siteWorkers.filter((worker) => worker._id);
        if (workersToSave.length !== siteWorkers.length) {
            setError("Some active workers are missing valid IDs. Reload the page and try again.");
            return;
        }

        const hasInvalidStatus = workersToSave.some(
            (worker) => !["Present", "Half-Day", "Absent"].includes(attendance[worker._id])
        );
        if (hasInvalidStatus) {
            setError("Choose an attendance status for every active worker before saving.");
            return;
        }

        try {
            savingRef.current = true;
            setSaving(true);
            setError("");

            const results = await Promise.allSettled(workersToSave.map((worker) => {
                const status = attendance[worker._id];
                const existingRecord = existingAttendance[worker._id];

                if (existingRecord?.id) {
                    return api.put(`/attendance/${existingRecord.id}`, { status });
                }

                return api.post("/attendance", {
                    workerId: worker._id,
                    siteId: selectedSite,
                    date: selectedDate,
                    status
                });
            }));

            const failedResults = results.filter(
                (result) => result.status === "rejected" && result.reason?.response?.status !== 409
            );
            const hadConflict = results.some(
                (result) => result.status === "rejected" && result.reason?.response?.status === 409
            );

            if (hadConflict) {
                console.warn("Attendance conflict detected; refreshing from the server.");
            }

            const refreshResult = await fetchExistingAttendance(selectedSite, selectedDate);

            if (failedResults.length > 0) {
                console.error("Some attendance records could not be saved:", failedResults);
                setError(getApiErrorMessage(failedResults[0].reason, "Some attendance records could not be saved."));
                return;
            }

            if (!refreshResult?.ok) {
                setError("Attendance was submitted, but the latest records could not be loaded. Please refresh attendance.");
                return;
            }

            alert(hadConflict
                ? "Attendance synchronized with the latest saved records."
                : "Attendance saved successfully!");

        } catch (error) {
            console.error("Save attendance error:", error);

            setError(getApiErrorMessage(error, "Failed to save attendance."));

        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };


    const existingCount = siteWorkers.filter(
        (worker) => existingAttendance[worker._id]
    ).length;

    const markedCount = siteWorkers.filter(
        (worker) => ["Present", "Half-Day", "Absent"].includes(attendance[worker._id])
    ).length;

    const presentCount = siteWorkers.filter((worker) => attendance[worker._id] === "Present").length;
    const halfDayCount = siteWorkers.filter((worker) => attendance[worker._id] === "Half-Day").length;
    const absentCount = siteWorkers.filter((worker) => attendance[worker._id] === "Absent").length;
    const unmarkedCount = siteWorkers.length - markedCount;

    const allAttendanceSaved =
        siteWorkers.length > 0 &&
        siteWorkers.every(
            (worker) =>
                existingAttendance[worker._id]
        );


    const getWage = (worker) => {
        const status = attendance[worker._id];

        if (status === "Present") {
            return Number(worker.dailyWage) || 0;
        }

        if (status === "Half-Day") {
            return (Number(worker.dailyWage) || 0) * 0.5;
        }

        return 0;
    };

    const totalWage = siteWorkers.reduce(
        (total, worker) =>
            total + getWage(worker),
        0
    );


    return (
        <div className="min-h-screen bg-slate-100">

            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="lg:ml-64">


                <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">

                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(true)
                        }
                        className="lg:hidden w-10 h-10 rounded-lg hover:bg-slate-100 text-xl"
                    >
                        ☰
                    </button>

                    <div className="hidden lg:block">
                        <p className="text-sm text-slate-500">
                            Workforce Management
                        </p>

                        <h1 className="font-bold text-slate-900">
                            Attendance
                        </h1>
                    </div>

                </header>

                <main className="p-4 sm:p-6 lg:p-8">


                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-slate-900">
                            Daily Attendance
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Mark worker attendance and calculate daily wages
                        </p>

                    </div>


                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                            {error}
                        </div>
                    )}


                    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                            <div>

                                <label htmlFor="attendance-site" className="form-label">
                                    Construction Site
                                </label>

                                <select
                                    id="attendance-site"
                                    value={selectedSite}
                                    onChange={(e) => {
                                        setSelectedSite(
                                            e.target.value
                                        );

                                        setAttendance({});
                                        setExistingAttendance({});
                                        setError("");
                                    }}
                                    className="form-input"
                                    disabled={loading || saving}
                                >

                                    <option value="">
                                        Select a site
                                    </option>

                                    {activeSites.map((site) => (
                                            <option
                                                key={site._id}
                                                value={site._id}
                                            >
                                                {site.siteName}
                                            </option>
                                        ))}

                                </select>

                            </div>


                            <div>

                                <label htmlFor="attendance-date" className="form-label">
                                    Attendance Date
                                </label>

                                <input
                                    id="attendance-date"
                                    type="date"
                                    value={selectedDate}
                                    max={getLocalDateString()}
                                    onChange={(e) => {
                                        setSelectedDate(
                                            e.target.value
                                        );
                                        setAttendance({});
                                        setExistingAttendance({});
                                        setError("");
                                    }}
                                    className="form-input"
                                    disabled={loading || saving}
                                />

                            </div>

                        </div>

                    </div>


                    {!selectedSite && !loading && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

                            <div className="text-5xl">
                                📋
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mt-4">
                                Select a construction site
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Choose a site to view its active workers.
                            </p>

                        </div>
                    )}


                    {selectedSite && loadingAttendance && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

                            <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                            <p className="text-sm text-slate-500 mt-4">
                                Loading attendance...
                            </p>

                        </div>
                    )}


                    {selectedSite &&
                        !loadingAttendance && (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">


                                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                    <div>

                                        <h3 className="font-bold text-slate-900">
                                            Worker Attendance
                                        </h3>

                                        <p className="text-sm text-slate-500 mt-1">
                                            {siteWorkers.length} active worker
                                            {siteWorkers.length !== 1
                                                ? "s"
                                                : ""}

                                            {siteWorkers.length > 0 && (
                                                <span className="ml-2 text-emerald-600 font-medium">
                                                    • {markedCount} marked ({existingCount} saved) • Present {presentCount} • Half-Day {halfDayCount} • Absent {absentCount} • Unmarked {unmarkedCount}
                                                </span>
                                            )}
                                        </p>

                                    </div>

                                    <div className="flex gap-2 flex-wrap">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                markAll("Present")
                                            }
                                            disabled={saving || loadingAttendance}
                                            className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-semibold hover:bg-emerald-100"
                                        >
                                            All Present
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                markAll("Absent")
                                            }
                                            disabled={saving || loadingAttendance}
                                            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100"
                                        >
                                            All Absent
                                        </button>

                                    </div>

                                </div>

                                {siteWorkers.length === 0 ? (

                                    <div className="p-12 text-center">

                                        <div className="text-4xl">
                                            👷
                                        </div>

                                        <p className="font-semibold text-slate-900 mt-3">
                                            No active workers
                                        </p>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Add workers to this site first.
                                        </p>

                                    </div>

                                ) : (

                                    <>


                                        <div className="hidden md:block overflow-x-auto">

                                            <table className="w-full">

                                                <thead className="bg-slate-50 border-b border-slate-200">

                                                    <tr>

                                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                            Worker
                                                        </th>

                                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                            Role
                                                        </th>

                                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                            Daily Wage
                                                        </th>

                                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                            Attendance
                                                        </th>

                                                        <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                            Earned
                                                        </th>

                                                    </tr>

                                                </thead>

                                                <tbody className="divide-y divide-slate-100">

                                                    {siteWorkers.map(
                                                        (worker) => {

                                                            const status = attendance[worker._id];

                                                            return (
                                                                <tr
                                                                    key={
                                                                        worker._id
                                                                    }
                                                                    className="hover:bg-slate-50"
                                                                >

                                                                    <td className="px-6 py-4">

                                                                        <div className="flex items-center gap-3">

                                                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                                                {worker.name
                                                                                    ?.charAt(
                                                                                        0
                                                                                    )
                                                                                    ?.toUpperCase()}
                                                                            </div>

                                                                            <span className="font-semibold text-slate-900">
                                                                                {
                                                                                    worker.name
                                                                                }
                                                                            </span>

                                                                        </div>

                                                                    </td>

                                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                                        {
                                                                            worker.role
                                                                        }
                                                                    </td>

                                                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                                        ₹
                                                                        {Number(
                                                                            worker.dailyWage
                                                                        ).toLocaleString(
                                                                            "en-IN"
                                                                        )}
                                                                    </td>

                                                                    <td className="px-6 py-4">

                                                                        <div className="flex gap-2">

                                                                            {[
                                                                                "Present",
                                                                                "Half-Day",
                                                                                "Absent"
                                                                            ].map(
                                                                                (
                                                                                    option
                                                                                ) => (
                                                                                    <button
                                                                                        key={
                                                                                            option
                                                                                        }
                                                                                        type="button"
                                                                                        aria-pressed={status === option}
                                                                                        disabled={saving || loadingAttendance}
                                                                                        onClick={() =>
                                                                                            handleAttendanceChange(
                                                                                                worker._id,
                                                                                                option
                                                                                            )
                                                                                        }
                                                                                        className={`
                                                                                            px-3 py-2 rounded-lg text-xs font-semibold border
                                                                                            ${
                                                                                                status ===
                                                                                                option
                                                                                                    ? option ===
                                                                                                      "Present"
                                                                                                        ? "bg-emerald-500 text-white border-emerald-500"
                                                                                                        : option ===
                                                                                                          "Half-Day"
                                                                                                            ? "bg-amber-500 text-white border-amber-500"
                                                                                                            : "bg-red-500 text-white border-red-500"
                                                                                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                                                                            }
                                                                                        `}
                                                                                    >
                                                                                        {
                                                                                            option
                                                                                        }
                                                                                    </button>
                                                                                )
                                                                            )}

                                                                        </div>

                                                                    </td>

                                                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                                                        ₹
                                                                        {getWage(
                                                                            worker
                                                                        ).toLocaleString(
                                                                            "en-IN"
                                                                        )}
                                                                    </td>

                                                                </tr>
                                                            );
                                                        }
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>


                                        <div className="md:hidden divide-y divide-slate-100">

                                            {siteWorkers.map(
                                                (worker) => {

                                                    const status = attendance[worker._id];

                                                    return (
                                                        <div
                                                            key={
                                                                worker._id
                                                            }
                                                            className="p-5"
                                                        >

                                                            <div className="flex items-center justify-between">

                                                                <div className="flex items-center gap-3">

                                                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                                        {worker.name
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            ?.toUpperCase()}
                                                                    </div>

                                                                    <div>

                                                                        <p className="font-semibold text-slate-900">
                                                                            {
                                                                                worker.name
                                                                            }
                                                                        </p>

                                                                        <p className="text-xs text-slate-500">
                                                                            {
                                                                                worker.role
                                                                            }
                                                                            {" "}
                                                                            • ₹
                                                                            {
                                                                                worker.dailyWage
                                                                            }
                                                                        </p>

                                                                    </div>

                                                                </div>

                                                                <span className="font-bold text-slate-900">
                                                                    ₹
                                                                    {getWage(
                                                                        worker
                                                                    )}
                                                                </span>

                                                            </div>

                                                            <div className="grid grid-cols-3 gap-2 mt-4">

                                                                {[
                                                                    "Present",
                                                                    "Half-Day",
                                                                    "Absent"
                                                                ].map(
                                                                    (
                                                                        option
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                option
                                                                            }
                                                                            type="button"
                                                                            aria-pressed={status === option}
                                                                            disabled={saving || loadingAttendance}
                                                                            onClick={() =>
                                                                                handleAttendanceChange(
                                                                                    worker._id,
                                                                                    option
                                                                                )
                                                                            }
                                                                            className={`
                                                                                py-2 rounded-lg text-xs font-semibold border
                                                                                ${
                                                                                    status ===
                                                                                    option
                                                                                        ? option ===
                                                                                          "Present"
                                                                                            ? "bg-emerald-500 text-white border-emerald-500"
                                                                                            : option ===
                                                                                              "Half-Day"
                                                                                                ? "bg-amber-500 text-white border-amber-500"
                                                                                                : "bg-red-500 text-white border-red-500"
                                                                                        : "bg-white text-slate-500 border-slate-200"
                                                                                }
                                                                            `}
                                                                        >
                                                                            {
                                                                                option
                                                                            }
                                                                        </button>
                                                                    )
                                                                )}

                                                            </div>

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>


                                        <div className="p-5 border-t border-slate-200 bg-slate-50">

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                                                <div>

                                                    <p className="text-sm text-slate-500">
                                                        Estimated wages for this day
                                                    </p>

                                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                                        ₹
                                                        {totalWage.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleSaveAttendance
                                                    }
                                                    disabled={
                                                        saving ||
                                                        loadingAttendance
                                                    }
                                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold"
                                                >
                                                    {saving
                                                        ? "Saving..."
                                                        : allAttendanceSaved
                                                            ? "Update Attendance"
                                                            : existingCount > 0
                                                                ? "Save / Update Attendance"
                                                                : "Save Attendance"}
                                                </button>

                                            </div>

                                        </div>

                                    </>
                                )}

                            </div>
                        )}

                </main>

            </div>

        </div>
    );
};

export default Attendance;