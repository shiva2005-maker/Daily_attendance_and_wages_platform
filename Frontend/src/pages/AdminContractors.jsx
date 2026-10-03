import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const AdminContractors = () => {
    const [contractors, setContractors] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchContractors = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/contractors");

            setContractors(response.data.contractors || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load contractors"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContractors();
    }, []);

    const filteredContractors = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return contractors;

        return contractors.filter((contractor) =>
            [
                contractor.name,
                contractor.email,
                contractor.phone
            ]
                .filter(Boolean)
                .some((field) =>
                    field.toLowerCase().includes(value)
                )
        );
    }, [contractors, search]);

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Contractors
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                Manage registered contractors
                            </p>
                        </div>

                        <button
                            onClick={fetchContractors}
                            disabled={loading}
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 transition"
                        >
                            {loading ? "Refreshing..." : "↻ Refresh"}
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
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                            <div className="flex-1">
                                <label className="form-label">
                                    Search Contractors
                                </label>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search by name, email or phone..."
                                    className="form-input"
                                />
                            </div>

                            <div className="text-sm text-slate-500 pb-2">
                                Showing{" "}
                                <span className="font-semibold text-slate-800">
                                    {filteredContractors.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-800">
                                    {contractors.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {loading && contractors.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

                            <p className="mt-4 text-sm text-slate-500">
                                Loading contractors...
                            </p>
                        </div>
                    ) : filteredContractors.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="text-5xl mb-4">
                                👥
                            </div>

                            <h2 className="font-bold text-slate-800">
                                No contractors found
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Try changing your search.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Contractor
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Phone
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Role
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Registered
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {filteredContractors.map(
                                                (contractor) => (
                                                    <tr
                                                        key={contractor._id}
                                                        className="hover:bg-slate-50 transition"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="font-semibold text-slate-800">
                                                                    {
                                                                        contractor.name
                                                                    }
                                                                </p>

                                                                <p className="text-sm text-slate-500">
                                                                    {
                                                                        contractor.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            {contractor.phone ||
                                                                "—"}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                                {
                                                                    contractor.role
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            {contractor.createdAt
                                                                ? new Date(
                                                                      contractor.createdAt
                                                                  ).toLocaleDateString(
                                                                      "en-IN"
                                                                  )
                                                                : "—"}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="lg:hidden space-y-4">
                                {filteredContractors.map(
                                    (contractor) => (
                                        <div
                                            key={contractor._id}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h2 className="font-bold text-slate-800 truncate">
                                                        {
                                                            contractor.name
                                                        }
                                                    </h2>

                                                    <p className="text-sm text-slate-500 break-all mt-1">
                                                        {
                                                            contractor.email
                                                        }
                                                    </p>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    {
                                                        contractor.role
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Phone
                                                    </p>

                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {contractor.phone ||
                                                            "—"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Registered
                                                    </p>

                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {contractor.createdAt
                                                            ? new Date(
                                                                  contractor.createdAt
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

export default AdminContractors;