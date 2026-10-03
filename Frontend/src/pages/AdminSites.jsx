import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const AdminSites = () => {
    const [sites, setSites] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSites = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/sites");

            setSites(response.data.sites || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load sites"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSites();
    }, []);

    const filteredSites = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return sites.filter((site) => {
            const matchesSearch =
                !searchValue ||
                [
                    site.siteName,
                    site.location,
                    site.clientName,
                    site.contractorId?.name,
                    site.contractorId?.email
                ]
                    .filter(Boolean)
                    .some((field) =>
                        field
                            .toLowerCase()
                            .includes(searchValue)
                    );

            const matchesStatus =
                statusFilter === "All" ||
                site.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [sites, search, statusFilter]);

    const getStatusClass = (status) => {
        if (status === "Active") {
            return "bg-emerald-50 text-emerald-700";
        }

        if (status === "Completed") {
            return "bg-blue-50 text-blue-700";
        }

        return "bg-amber-50 text-amber-700";
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Construction Sites
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                View all construction sites across the platform
                            </p>
                        </div>

                        <button
                            onClick={fetchSites}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="form-label">
                                    Search Sites
                                </label>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search by site, location, client or contractor..."
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
                                        setStatusFilter(e.target.value)
                                    }
                                    className="form-input"
                                >
                                    <option value="All">
                                        All Status
                                    </option>

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="On Hold">
                                        On Hold
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-800">
                                {filteredSites.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-800">
                                {sites.length}
                            </span>{" "}
                            sites
                        </div>
                    </div>

                    {loading && sites.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

                            <p className="mt-4 text-sm text-slate-500">
                                Loading construction sites...
                            </p>
                        </div>
                    ) : filteredSites.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="text-5xl mb-4">
                                🏗️
                            </div>

                            <h2 className="font-bold text-slate-800">
                                No sites found
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Try changing your search or status filter.
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
                                                    Site
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Location
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Client
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Contractor
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Start Date
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {filteredSites.map(
                                                (site) => (
                                                    <tr
                                                        key={site._id}
                                                        className="hover:bg-slate-50 transition"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-slate-800">
                                                                {
                                                                    site.siteName
                                                                }
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-700">
                                                                {
                                                                    site.location
                                                                }
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-700">
                                                                {site.clientName ||
                                                                    "—"}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-slate-700">
                                                                {site
                                                                    .contractorId
                                                                    ?.name ||
                                                                    "—"}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {site
                                                                    .contractorId
                                                                    ?.email ||
                                                                    ""}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            {site.startDate
                                                                ? new Date(
                                                                      site.startDate
                                                                  ).toLocaleDateString(
                                                                      "en-IN"
                                                                  )
                                                                : "—"}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                                    site.status
                                                                )}`}
                                                            >
                                                                {
                                                                    site.status
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
                                {filteredSites.map(
                                    (site) => (
                                        <div
                                            key={site._id}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h2 className="font-bold text-slate-800">
                                                        {
                                                            site.siteName
                                                        }
                                                    </h2>

                                                    <p className="text-sm text-slate-500 mt-1">
                                                        📍{" "}
                                                        {
                                                            site.location
                                                        }
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                        site.status
                                                    )}`}
                                                >
                                                    {
                                                        site.status
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Client
                                                    </p>

                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {site.clientName ||
                                                            "—"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Contractor
                                                    </p>

                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {site
                                                            .contractorId
                                                            ?.name ||
                                                            "—"}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {site
                                                            .contractorId
                                                            ?.email ||
                                                            ""}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Start Date
                                                    </p>

                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {site.startDate
                                                            ? new Date(
                                                                  site.startDate
                                                              ).toLocaleDateString(
                                                                  "en-IN"
                                                              )
                                                            : "—"}
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

export default AdminSites;