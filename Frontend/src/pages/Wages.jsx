import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const Wages = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState("");

    const [summary, setSummary] = useState(null);

    const [loadingWorkers, setLoadingWorkers] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(false);

    const [error, setError] = useState("");

    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: ""
    });



    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setLoadingWorkers(true);

                const response = await api.get("/workers");

                setWorkers(response.data.workers || []);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to fetch workers"
                );
            } finally {
                setLoadingWorkers(false);
            }
        };

        fetchWorkers();
    }, []);


    const fetchSummary = async () => {
        if (!selectedWorker) {
            setSummary(null);
            return;
        }

        try {
            setLoadingSummary(true);
            setError("");

            const params = {};

            if (dateRange.startDate) {
                params.startDate = dateRange.startDate;
            }

            if (dateRange.endDate) {
                params.endDate = dateRange.endDate;
            }

            const response = await api.get(
                `/wages/worker/${selectedWorker}`,
                { params }
            );

            const data = response.data;

            setSummary({
                ...data,

                presentDays: data.attendance?.presentDays ?? 0,
                halfDays: data.attendance?.halfDays ?? 0,
                absentDays: data.attendance?.absentDays ?? 0,

                presentEarnings: data.earnings?.presentEarnings ?? 0,
                halfDayEarnings: data.earnings?.halfDayEarnings ?? 0,
                totalEarned: data.earnings?.totalEarned ?? 0,

                totalPaid: data.payments?.totalPaid ?? 0,
                pendingAmount: data.payments?.pendingAmount ?? 0
            });

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to fetch wage summary"
            );
        } finally {
            setLoadingSummary(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [
        selectedWorker,
        dateRange.startDate,
        dateRange.endDate
    ]);


    const worker = workers.find(
        (item) => item._id === selectedWorker
    );

    return (
        <div className="min-h-screen bg-slate-100">

            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="lg:ml-64">


                <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center">

                    <button
                        onClick={() =>
                            setMobileOpen(true)
                        }
                        className="lg:hidden w-10 h-10 rounded-lg hover:bg-slate-100 text-xl mr-3"
                    >
                        ☰
                    </button>

                    <div>
                        <p className="text-sm text-slate-500">
                            Payroll Management
                        </p>

                        <h1 className="font-bold text-slate-900">
                            Wage Calculation
                        </h1>
                    </div>

                </header>

                <main className="p-4 sm:p-6 lg:p-8">


                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-slate-900">
                            Worker Wages
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            View attendance, earnings, payments and pending wages.
                        </p>

                    </div>


                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                            {error}
                        </div>
                    )}


                    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                            <div>
                                <label className="form-label">
                                    Select Worker
                                </label>

                                <select
                                    value={selectedWorker}
                                    onChange={(e) =>
                                        setSelectedWorker(
                                            e.target.value
                                        )
                                    }
                                    className="form-input"
                                >
                                    <option value="">
                                        Select a worker
                                    </option>

                                    {workers.map((worker) => (
                                        <option
                                            key={worker._id}
                                            value={worker._id}
                                        >
                                            {worker.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <div>
                                <label className="form-label">
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) =>
                                        setDateRange({
                                            ...dateRange,
                                            startDate:
                                                e.target.value
                                        })
                                    }
                                    className="form-input"
                                />
                            </div>


                            <div>
                                <label className="form-label">
                                    End Date
                                </label>

                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) =>
                                        setDateRange({
                                            ...dateRange,
                                            endDate:
                                                e.target.value
                                        })
                                    }
                                    className="form-input"
                                />
                            </div>

                        </div>


                        <div className="flex flex-wrap gap-2 mt-5">

                            <button
                                onClick={() => {
                                    const now = new Date();

                                    const start =
                                        new Date(
                                            now.getFullYear(),
                                            now.getMonth(),
                                            1
                                        );

                                    setDateRange({
                                        startDate:
                                            start
                                                .toISOString()
                                                .split("T")[0],
                                        endDate:
                                            now
                                                .toISOString()
                                                .split("T")[0]
                                    });
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100"
                            >
                                This Month
                            </button>

                            <button
                                onClick={() => {
                                    setDateRange({
                                        startDate: "",
                                        endDate: ""
                                    });
                                }}
                                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200"
                            >
                                All Time
                            </button>

                        </div>

                    </div>


                    {!selectedWorker && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

                            <div className="text-5xl">
                                💰
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mt-4">
                                Select a worker
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Choose a worker to view their wage summary.
                            </p>

                        </div>
                    )}


                    {selectedWorker && loadingSummary && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

                            <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                            <p className="text-sm text-slate-500 mt-4">
                                Calculating wages...
                            </p>

                        </div>
                    )}


                    {selectedWorker &&
                        !loadingSummary &&
                        summary && (
                            <>


                                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                        <div className="flex items-center gap-4">

                                            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                                                {(
                                                    summary.worker?.name ||
                                                    worker?.name ||
                                                    "W"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>

                                                <h3 className="text-xl font-bold text-slate-900">
                                                    {summary.worker?.name ||
                                                        worker?.name}
                                                </h3>

                                                <p className="text-sm text-slate-500 mt-1">
                                                    {summary.worker?.role ||
                                                        worker?.role}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="text-left sm:text-right">

                                            <p className="text-xs text-slate-500">
                                                Daily Wage
                                            </p>

                                            <p className="text-xl font-bold text-slate-900">
                                                ₹
                                                {Number(
                                                    summary.worker
                                                        ?.dailyWage ||
                                                    worker?.dailyWage ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                                    <WageCard
                                        title="Total Earned"
                                        value={summary.totalEarned}
                                        icon="₹"
                                        bg="bg-blue-50"
                                        text="text-blue-600"
                                    />

                                    <WageCard
                                        title="Total Paid"
                                        value={summary.totalPaid}
                                        icon="✓"
                                        bg="bg-emerald-50"
                                        text="text-emerald-600"
                                    />

                                    <WageCard
                                        title="Pending"
                                        value={summary.pendingAmount}
                                        icon="!"
                                        bg="bg-orange-50"
                                        text="text-orange-600"
                                    />

                                    <WageCard
                                        title="Present Days"
                                        value={summary.presentDays}
                                        icon="P"
                                        bg="bg-purple-50"
                                        text="text-purple-600"
                                    />

                                </div>


                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">

                                        <h3 className="font-bold text-slate-900">
                                            Attendance Summary
                                        </h3>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Attendance used for wage calculation
                                        </p>

                                        <div className="space-y-4 mt-6">

                                            <SummaryRow
                                                label="Present Days"
                                                value={
                                                    summary.presentDays
                                                }
                                                color="text-emerald-600"
                                            />

                                            <SummaryRow
                                                label="Half Days"
                                                value={
                                                    summary.halfDays
                                                }
                                                color="text-amber-600"
                                            />

                                            <SummaryRow
                                                label="Absent Days"
                                                value={
                                                    summary.absentDays
                                                }
                                                color="text-red-600"
                                            />

                                        </div>

                                    </div>


                                    <div className="bg-white rounded-2xl border border-slate-200 p-6">

                                        <h3 className="font-bold text-slate-900">
                                            Earnings Breakdown
                                        </h3>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Based on attendance status
                                        </p>

                                        <div className="space-y-4 mt-6">

                                            <SummaryRow
                                                label="Present Earnings"
                                                value={`₹${Number(
                                                    summary.presentEarnings ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}`}
                                                color="text-emerald-600"
                                            />

                                            <SummaryRow
                                                label="Half-Day Earnings"
                                                value={`₹${Number(
                                                    summary.halfDayEarnings ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}`}
                                                color="text-amber-600"
                                            />

                                            <div className="border-t border-slate-100 pt-4 flex justify-between">

                                                <span className="font-semibold text-slate-700">
                                                    Total Earned
                                                </span>

                                                <span className="font-bold text-slate-900">
                                                    ₹
                                                    {Number(
                                                        summary.totalEarned ||
                                                        0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </>
                        )}

                </main>

            </div>

        </div>
    );
};

const WageCard = ({
    title,
    value,
    icon,
    bg,
    text
}) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">

        <div className="flex justify-between items-start">

            <div>

                <p className="text-sm text-slate-500">
                    {title}
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-2">
                    {typeof value === "number"
                        ? title.includes("Days")
                            ? value
                            : `₹${value.toLocaleString("en-IN")}`
                        : value}
                </p>

            </div>

            <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${bg} ${text}`}
            >
                {icon}
            </div>

        </div>

    </div>
);

const SummaryRow = ({
    label,
    value,
    color
}) => (
    <div className="flex items-center justify-between py-2">

        <span className="text-sm text-slate-500">
            {label}
        </span>

        <span className={`font-bold ${color}`}>
            {value}
        </span>

    </div>
);

export default Wages;