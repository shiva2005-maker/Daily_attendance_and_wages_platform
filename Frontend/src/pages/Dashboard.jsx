import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {useNavigate} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

const Dashboard = () => {

    const { user, logout } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const navigate = useNavigate();

    if (user?.role == "admin" ){
        navigate('/admin')
    }

    const fetchDashboard = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/dashboard/summary"
            );

            setDashboard(response.data);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard"
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading dashboard...
                    </p>

                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">

                    <p className="text-red-600 font-medium">
                        {error}
                    </p>

                    <button
                        onClick={fetchDashboard}
                        className="mt-4 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    const summary = dashboard?.summary || {};

    const attendance =
        summary.todayAttendance || {};

    return (
        <div className="min-h-screen bg-slate-100">

            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="lg:ml-64">

                <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">

                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden w-10 h-10 rounded-lg hover:bg-slate-100 text-xl"
                    >
                        ☰
                    </button>

                    <div className="hidden lg:block">
                        <p className="text-sm text-slate-500">
                            Contractor Dashboard
                        </p>

                        <p className="font-semibold text-slate-900">
                            Workforce Overview
                        </p>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">

                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-semibold text-slate-900">
                                {user?.name}
                            </p>

                            <p className="text-xs text-slate-500">
                                Contractor
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100"
                        >
                            Logout
                        </button>

                    </div>

                </header>

                <main className="p-4 sm:p-6 lg:p-8">

                    <div className="mb-8">

                        <p className="text-sm text-slate-500">
                            Welcome back 👋
                        </p>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                            {user?.name}
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Here's what's happening with your workforce today.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                        <StatCard
                            title="Active Workers"
                            value={summary.activeWorkers || 0}
                            description="Currently working"
                            icon="👷"
                            iconBg="bg-blue-50 text-blue-600"
                        />

                        <StatCard
                            title="Active Sites"
                            value={summary.activeSites || 0}
                            description="Ongoing projects"
                            icon="🏗️"
                            iconBg="bg-purple-50 text-purple-600"
                        />

                        <StatCard
                            title="Today's Present"
                            value={attendance.present || 0}
                            description={`${attendance.halfDay || 0} half-day`}
                            icon="✓"
                            iconBg="bg-emerald-50 text-emerald-600"
                        />

                        <StatCard
                            title="Pending Amount"
                            value={`₹${(summary.pendingAmount || 0).toLocaleString("en-IN")}`}
                            description="Outstanding wages"
                            icon="₹"
                            iconBg="bg-orange-50 text-orange-600"
                        />

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

                        <div className="bg-white rounded-2xl border border-slate-200 p-6">

                            <p className="text-sm text-slate-500">
                                Total Earned
                            </p>

                            <h2 className="text-3xl font-bold text-slate-900 mt-2">
                                ₹{(summary.totalEarned || 0).toLocaleString("en-IN")}
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Total wages calculated from attendance
                            </p>

                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6">

                            <p className="text-sm text-slate-500">
                                Total Paid
                            </p>

                            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
                                ₹{(summary.totalPaid || 0).toLocaleString("en-IN")}
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Payments made to workers
                            </p>

                        </div>

                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">

                        <div className="bg-white rounded-2xl border border-slate-200 p-6">

                            <div className="flex items-center justify-between mb-6">

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Today's Attendance
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Workforce status for today
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-5">

                                <AttendanceRow
                                    label="Present"
                                    count={attendance.present || 0}
                                    total={summary.activeWorkers || 1}
                                    bar="bg-emerald-500"
                                />

                                <AttendanceRow
                                    label="Half-Day"
                                    count={attendance.halfDay || 0}
                                    total={summary.activeWorkers || 1}
                                    bar="bg-amber-500"
                                />

                                <AttendanceRow
                                    label="Absent"
                                    count={attendance.absent || 0}
                                    total={summary.activeWorkers || 1}
                                    bar="bg-red-500"
                                />

                            </div>

                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6">

                            <div className="flex items-center justify-between mb-5">

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Recent Payments
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Latest worker payments
                                    </p>
                                </div>

                            </div>

                            {dashboard?.recentPayments?.length > 0 ? (

                                <div className="space-y-4">

                                    {dashboard.recentPayments.map(
                                        (payment) => (

                                            <div
                                                key={payment._id}
                                                className="flex items-center justify-between gap-4"
                                            >

                                                <div className="flex items-center gap-3 min-w-0">

                                                    <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
                                                        {payment.workerId?.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "W"}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="font-medium text-slate-900 truncate">
                                                            {payment.workerId?.name || "Worker"}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {payment.paymentMethod}
                                                        </p>

                                                    </div>

                                                </div>

                                                <p className="font-semibold text-emerald-600 shrink-0">
                                                    +₹{payment.amount.toLocaleString("en-IN")}
                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <div className="py-10 text-center">

                                    <div className="text-3xl">
                                        💳
                                    </div>

                                    <p className="text-sm text-slate-500 mt-3">
                                        No payments yet
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
};

const AttendanceRow = ({
    label,
    count,
    total,
    bar
}) => {

    const percentage =
        total > 0
            ? Math.min((count / total) * 100, 100)
            : 0;

    return (
        <div>

            <div className="flex items-center justify-between mb-2">

                <span className="text-sm font-medium text-slate-700">
                    {label}
                </span>

                <span className="text-sm font-semibold text-slate-900">
                    {count}
                </span>

            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                    className={`h-full rounded-full ${bar}`}
                    style={{
                        width: `${percentage}%`
                    }}
                />

            </div>

        </div>
    );
};

export default Dashboard;