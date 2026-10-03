import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [contractors, setContractors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            setError("");

            const [statsResponse, contractorsResponse] =
                await Promise.all([
                    api.get("/admin/stats"),
                    api.get("/admin/contractors")
                ]);

            setStats(statsResponse.data.stats);
            setContractors(
                contractorsResponse.data.contractors || []
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load admin dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

                    <p className="mt-4 text-slate-500">
                        Loading admin dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Admin Dashboard
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Monitor the overall labour management platform
                    </p>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Contractors
                                    </p>

                                    <p className="text-3xl font-bold text-slate-800 mt-2">
                                        {stats?.totalContractors || 0}
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                                    👥
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Workers
                                    </p>

                                    <p className="text-3xl font-bold text-slate-800 mt-2">
                                        {stats?.totalWorkers || 0}
                                    </p>

                                    <p className="text-xs text-emerald-600 mt-1">
                                        {stats?.activeWorkers || 0} active
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                                    👷
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Sites
                                    </p>

                                    <p className="text-3xl font-bold text-slate-800 mt-2">
                                        {stats?.totalSites || 0}
                                    </p>

                                    <p className="text-xs text-blue-600 mt-1">
                                        {stats?.activeSites || 0} active
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
                                    🏗️
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Payments
                                    </p>

                                    <p className="text-3xl font-bold text-slate-800 mt-2">
                                        ₹
                                        {Number(
                                            stats?.totalPayments || 0
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                                    💰
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-800">
                                Platform Overview
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Overall activity across the platform
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <span className="text-slate-600">
                                        Total Attendance Records
                                    </span>

                                    <span className="font-bold text-slate-800">
                                        {stats?.totalAttendance || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <span className="text-slate-600">
                                        Active Workers
                                    </span>

                                    <span className="font-bold text-emerald-600">
                                        {stats?.activeWorkers || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <span className="text-slate-600">
                                        Active Construction Sites
                                    </span>

                                    <span className="font-bold text-blue-600">
                                        {stats?.activeSites || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Contractors
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Recently registered contractors
                                    </p>
                                </div>

                                <span className="text-sm font-semibold text-blue-600">
                                    {contractors.length} total
                                </span>
                            </div>

                            <div className="mt-5 space-y-3 max-h-[320px] overflow-y-auto">
                                {contractors.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        No contractors found
                                    </div>
                                ) : (
                                    contractors
                                        .slice(0, 5)
                                        .map((contractor) => (
                                            <div
                                                key={contractor._id}
                                                className="flex items-center justify-between gap-3 p-4 border border-slate-200 rounded-xl"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800 truncate">
                                                        {contractor.name}
                                                    </p>

                                                    <p className="text-sm text-slate-500 truncate">
                                                        {contractor.email}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    Contractor
                                                </span>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;