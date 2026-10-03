import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import Sidebar from "../components/Sidebar";
import api from "../services/api";

const Reports = () => {
    const [sites, setSites] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [siteId, setSiteId] = useState("");

    const [report, setReport] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingSites, setLoadingSites] = useState(true);

    const [error, setError] = useState("");


    const fetchSites = async () => {
        try {
            setLoadingSites(true);

            const response = await api.get("/sites");

            setSites(response.data.sites || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load sites"
            );
        } finally {
            setLoadingSites(false);
        }
    };


    const fetchReport = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (startDate) {
                params.startDate = startDate;
            }

            if (endDate) {
                params.endDate = endDate;
            }

            if (siteId) {
                params.siteId = siteId;
            }

            const response = await api.get(
                "/reports",
                { params }
            );

            setReport(response.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to generate report"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSites();
        fetchReport();
    }, []);


    const clearFilters = async () => {
        setStartDate("");
        setEndDate("");
        setSiteId("");

        try {
            setLoading(true);
            setError("");

            const response = await api.get("/reports");

            setReport(response.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to generate report"
            );
        } finally {
            setLoading(false);
        }
    };


    const attendanceData = report
        ? [
            {
                name: "Present",
                value:
                    report.attendance?.present || 0
            },
            {
                name: "Half-Day",
                value:
                    report.attendance?.halfDay || 0
            },
            {
                name: "Absent",
                value:
                    report.attendance?.absent || 0
            }
        ]
        : [];

    const workerChartData =
        report?.workerSummary?.map(
            (worker) => ({
                name:
                    worker.name.length > 12
                        ? worker.name.substring(0, 12) +
                        "..."
                        : worker.name,
                earned: worker.earned || 0
            })
        ) || [];

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN"
        )}`;
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Reports & Analytics
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Analyze attendance, earnings and payments
                        </p>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="form-label">
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    max={endDate || undefined}
                                    onChange={(e) =>
                                        setStartDate(
                                            e.target.value
                                        )
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
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(e) =>
                                        setEndDate(
                                            e.target.value
                                        )
                                    }
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Site
                                </label>

                                <select
                                    value={siteId}
                                    onChange={(e) =>
                                        setSiteId(
                                            e.target.value
                                        )
                                    }
                                    className="form-input"
                                    disabled={
                                        loadingSites
                                    }
                                >
                                    <option value="">
                                        All Sites
                                    </option>

                                    {sites
                                        .filter(
                                            (site) =>
                                                site.status !==
                                                "Completed"
                                        )
                                        .map(
                                            (site) => (
                                                <option
                                                    key={
                                                        site._id
                                                    }
                                                    value={
                                                        site._id
                                                    }
                                                >
                                                    {
                                                        site.siteName
                                                    }
                                                </option>
                                            )
                                        )}
                                </select>
                            </div>

                            <div className="flex items-end gap-3">
                                <button
                                    onClick={fetchReport}
                                    disabled={
                                        loading
                                    }
                                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 transition"
                                >
                                    {loading
                                        ? "Generating..."
                                        : "Generate Report"}
                                </button>

                                <button
                                    onClick={clearFilters}
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading && !report ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

                            <p className="mt-4 text-sm text-slate-500">
                                Generating report...
                            </p>
                        </div>
                    ) : report ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <p className="text-sm text-slate-500">
                                        Total Attendance
                                    </p>

                                    <p className="text-2xl font-bold text-slate-800 mt-2">
                                        {
                                            report
                                                .attendance
                                                ?.total
                                        }
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        All attendance records
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <p className="text-sm text-slate-500">
                                        Total Earned
                                    </p>

                                    <p className="text-2xl font-bold text-blue-600 mt-2">
                                        {formatCurrency(
                                            report
                                                .financial
                                                ?.totalEarned
                                        )}
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Worker earnings
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <p className="text-sm text-slate-500">
                                        Total Paid
                                    </p>

                                    <p className="text-2xl font-bold text-emerald-600 mt-2">
                                        {formatCurrency(
                                            report
                                                .financial
                                                ?.totalPaid
                                        )}
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Payments recorded
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <p className="text-sm text-slate-500">
                                        Pending
                                    </p>

                                    <p className="text-2xl font-bold text-amber-600 mt-2">
                                        {formatCurrency(
                                            report
                                                .financial
                                                ?.pendingAmount
                                        )}
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Remaining amount
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Attendance Summary
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Present, half-day and absent records
                                    </p>

                                    <div className="h-80 mt-4">
                                        {report.attendance
                                            ?.total > 0 ? (
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={
                                                            attendanceData
                                                        }
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={
                                                            100
                                                        }
                                                        label
                                                    >
                                                        {attendanceData.map(
                                                            (
                                                                entry,
                                                                index
                                                            ) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                />
                                                            )
                                                        )}
                                                    </Pie>

                                                    <Tooltip />

                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-sm text-slate-500">
                                                No attendance data
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Worker Earnings
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Earnings by worker
                                    </p>

                                    <div className="h-80 mt-4">
                                        {workerChartData.length >
                                            0 ? (
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={
                                                        workerChartData
                                                    }
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />

                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{
                                                            fontSize: 11
                                                        }}
                                                    />

                                                    <YAxis />

                                                    <Tooltip
                                                        formatter={(
                                                            value
                                                        ) =>
                                                            formatCurrency(
                                                                value
                                                            )
                                                        }
                                                    />

                                                    <Bar
                                                        dataKey="earned"
                                                        radius={[
                                                            6,
                                                            6,
                                                            0,
                                                            0
                                                        ]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-sm text-slate-500">
                                                No worker earnings data
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Attendance Breakdown
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                                    <div className="rounded-xl bg-emerald-50 p-5">
                                        <p className="text-sm text-emerald-700">
                                            Present
                                        </p>

                                        <p className="text-3xl font-bold text-emerald-700 mt-2">
                                            {
                                                report
                                                    .attendance
                                                    ?.present
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-amber-50 p-5">
                                        <p className="text-sm text-amber-700">
                                            Half-Day
                                        </p>

                                        <p className="text-3xl font-bold text-amber-700 mt-2">
                                            {
                                                report
                                                    .attendance
                                                    ?.halfDay
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-red-50 p-5">
                                        <p className="text-sm text-red-700">
                                            Absent
                                        </p>

                                        <p className="text-3xl font-bold text-red-700 mt-2">
                                            {
                                                report
                                                    .attendance
                                                    ?.absent
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                                <div className="p-5 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Worker-wise Summary
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Attendance and earnings for each worker
                                    </p>
                                </div>

                                {report.workerSummary?.length ===
                                    0 ? (
                                    <div className="p-10 text-center text-sm text-slate-500">
                                        No worker data available
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Worker
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Role
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Present
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Half-Day
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Absent
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Earned
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {report.workerSummary.map(
                                                    (
                                                        worker
                                                    ) => (
                                                        <tr
                                                            key={
                                                                worker.workerId
                                                            }
                                                            className="hover:bg-slate-50"
                                                        >
                                                            <td className="px-5 py-4 font-semibold text-slate-800">
                                                                {
                                                                    worker.name
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                                {
                                                                    worker.role
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-emerald-600 font-semibold">
                                                                {
                                                                    worker.present
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-amber-600 font-semibold">
                                                                {
                                                                    worker.halfDay
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-red-600 font-semibold">
                                                                {
                                                                    worker.absent
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 font-bold text-slate-800">
                                                                {formatCurrency(
                                                                    worker.earned
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                                <div className="p-5 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Site-wise Attendance
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Attendance distribution by construction site
                                    </p>
                                </div>

                                {report.siteSummary?.length ===
                                    0 ? (
                                    <div className="p-10 text-center text-sm text-slate-500">
                                        No site data available
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Site
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Location
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Present
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Half-Day
                                                    </th>

                                                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                        Absent
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {report.siteSummary.map(
                                                    (
                                                        site
                                                    ) => (
                                                        <tr
                                                            key={
                                                                site.siteId
                                                            }
                                                            className="hover:bg-slate-50"
                                                        >
                                                            <td className="px-5 py-4 font-semibold text-slate-800">
                                                                {
                                                                    site.siteName
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                                {
                                                                    site.location
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 font-semibold text-emerald-600">
                                                                {
                                                                    site.present
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 font-semibold text-amber-600">
                                                                {
                                                                    site.halfDay
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 font-semibold text-red-600">
                                                                {
                                                                    site.absent
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Recent Payments
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Latest payments within the selected period
                                    </p>
                                </div>

                                {report.recentPayments?.length ===
                                    0 ? (
                                    <div className="p-10 text-center text-sm text-slate-500">
                                        No payments available
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {report.recentPayments.map(
                                            (
                                                payment
                                            ) => (
                                                <div
                                                    key={
                                                        payment._id
                                                    }
                                                    className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {payment
                                                                .workerId
                                                                ?.name ||
                                                                "Unknown Worker"}
                                                        </p>

                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {payment
                                                                .workerId
                                                                ?.role ||
                                                                ""}
                                                        </p>
                                                    </div>

                                                    <div className="sm:text-right">
                                                        <p className="font-bold text-emerald-600">
                                                            {formatCurrency(
                                                                payment.amount
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {
                                                                payment.paymentMethod
                                                            }{" "}
                                                            •{" "}
                                                            {payment.paymentDate
                                                                ? new Date(
                                                                    payment.paymentDate
                                                                ).toLocaleDateString(
                                                                    "en-IN"
                                                                )
                                                                : "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </main>
        </div>
    );
};

export default Reports;