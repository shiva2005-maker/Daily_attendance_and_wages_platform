import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const AdminWorkers = () => {
    const [workers, setWorkers] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [roleFilter, setRoleFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/workers");

            setWorkers(response.data.workers || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load workers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    const roles = useMemo(() => {
        const uniqueRoles = [
            ...new Set(
                workers
                    .map((worker) => worker.role)
                    .filter(Boolean)
            )
        ];

        return uniqueRoles.sort();
    }, [workers]);

    const filteredWorkers = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return workers.filter((worker) => {
            const matchesSearch =
                !searchValue ||
                [
                    worker.name,
                    worker.phone,
                    worker.role,
                    worker.contractorId?.name,
                    worker.contractorId?.email,
                    worker.siteId?.siteName,
                    worker.siteId?.location
                ]
                    .filter(Boolean)
                    .some((field) =>
                        field
                            .toLowerCase()
                            .includes(searchValue)
                    );

            const matchesStatus =
                statusFilter === "All" ||
                worker.status === statusFilter;

            const matchesRole =
                roleFilter === "All" ||
                worker.role === roleFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRole
            );
        });
    }, [
        workers,
        search,
        statusFilter,
        roleFilter
    ]);

    const getStatusClass = (status) => {
        if (status === "Active") {
            return "bg-emerald-50 text-emerald-700";
        }

        return "bg-slate-100 text-slate-600";
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Workers
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                View workers across all contractors
                            </p>
                        </div>

                        <button
                            onClick={fetchWorkers}
                            disabled={loading}
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 transition"
                        >
                            {loading
                                ? "Refreshing..."
                                : "↻ Refresh"}
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div className="xl:col-span-2">
                                <label className="form-label">
                                    Search Workers
                                </label>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Name, phone, role, contractor or site..."
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                    className="form-input"
                                >
                                    <option value="All">
                                        All Status
                                    </option>

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="form-label">
                                    Role
                                </label>

                                <select
                                    value={roleFilter}
                                    onChange={(e) =>
                                        setRoleFilter(
                                            e.target.value
                                        )
                                    }
                                    className="form-input"
                                >
                                    <option value="All">
                                        All Roles
                                    </option>

                                    {roles.map((role) => (
                                        <option
                                            key={role}
                                            value={role}
                                        >
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-800">
                                {filteredWorkers.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-800">
                                {workers.length}
                            </span>{" "}
                            workers
                        </div>
                    </div>

                    {loading && workers.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

                            <p className="mt-4 text-sm text-slate-500">
                                Loading workers...
                            </p>
                        </div>
                    ) : filteredWorkers.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="text-5xl mb-4">
                                👷
                            </div>

                            <h2 className="font-bold text-slate-800">
                                No workers found
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden xl:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
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
                                                    Contractor
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Site
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Daily Wage
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {filteredWorkers.map(
                                                (worker) => (
                                                    <tr
                                                        key={
                                                            worker._id
                                                        }
                                                        className="hover:bg-slate-50 transition"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-slate-800">
                                                                {
                                                                    worker.name
                                                                }
                                                            </p>

                                                            <p className="text-sm text-slate-500">
                                                                {worker.phone ||
                                                                    "No phone"}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                                {
                                                                    worker.role
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-slate-700">
                                                                {worker
                                                                    .contractorId
                                                                    ?.name ||
                                                                    "—"}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {worker
                                                                    .contractorId
                                                                    ?.email ||
                                                                    ""}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-slate-700">
                                                                {worker
                                                                    .siteId
                                                                    ?.siteName ||
                                                                    "—"}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {worker
                                                                    .siteId
                                                                    ?.location ||
                                                                    ""}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="font-semibold text-slate-800">
                                                                ₹
                                                                {Number(
                                                                    worker.dailyWage ||
                                                                        0
                                                                ).toLocaleString()}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                                    worker.status
                                                                )}`}
                                                            >
                                                                {
                                                                    worker.status
                                                                }
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredWorkers.map(
                                    (worker) => (
                                        <div
                                            key={
                                                worker._id
                                            }
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h2 className="font-bold text-slate-800 truncate">
                                                        {
                                                            worker.name
                                                        }
                                                    </h2>

                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {worker.phone ||
                                                            "No phone"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                        worker.status
                                                    )}`}
                                                >
                                                    {
                                                        worker.status
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    {
                                                        worker.role
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Contractor
                                                    </p>

                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {worker
                                                            .contractorId
                                                            ?.name ||
                                                            "—"}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {worker
                                                            .contractorId
                                                            ?.email ||
                                                            ""}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Construction Site
                                                    </p>

                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {worker
                                                            .siteId
                                                            ?.siteName ||
                                                            "—"}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {worker
                                                            .siteId
                                                            ?.location ||
                                                            ""}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Daily Wage
                                                    </p>

                                                    <p className="text-sm font-bold text-slate-800 mt-1">
                                                        ₹
                                                        {Number(
                                                            worker.dailyWage ||
                                                                0
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminWorkers;