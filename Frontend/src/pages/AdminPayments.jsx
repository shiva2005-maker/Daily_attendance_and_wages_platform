import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);

    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/payments");

            setPayments(response.data.payments || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load payments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return payments.filter((payment) => {
            const matchesSearch =
                !searchValue ||
                [
                    payment.workerId?.name,
                    payment.workerId?.role,
                    payment.contractorId?.name,
                    payment.contractorId?.email,
                    payment.paymentMethod,
                    payment.notes
                ]
                    .filter(Boolean)
                    .some((field) =>
                        field
                            .toLowerCase()
                            .includes(searchValue)
                    );

            const matchesMethod =
                methodFilter === "All" ||
                payment.paymentMethod === methodFilter;

            return matchesSearch && matchesMethod;
        });
    }, [payments, search, methodFilter]);

    const totalAmount = useMemo(() => {
        return filteredPayments.reduce(
            (total, payment) =>
                total + Number(payment.amount || 0),
            0
        );
    }, [filteredPayments]);

    const getMethodClass = (method) => {
        if (method === "Cash") {
            return "bg-emerald-50 text-emerald-700";
        }

        if (method === "UPI") {
            return "bg-blue-50 text-blue-700";
        }

        return "bg-purple-50 text-purple-700";
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Payments
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                Monitor all payments across the platform
                            </p>
                        </div>

                        <button
                            onClick={fetchPayments}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Payments
                                    </p>

                                    <p className="text-2xl font-bold text-slate-800 mt-2">
                                        {filteredPayments.length}
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                                    💳
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Amount
                                    </p>

                                    <p className="text-2xl font-bold text-emerald-600 mt-2">
                                        ₹
                                        {totalAmount.toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                                    💰
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="form-label">
                                    Search Payments
                                </label>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Worker, contractor, email, method or notes..."
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Payment Method
                                </label>

                                <select
                                    value={methodFilter}
                                    onChange={(e) =>
                                        setMethodFilter(
                                            e.target.value
                                        )
                                    }
                                    className="form-input"
                                >
                                    <option value="All">
                                        All Methods
                                    </option>

                                    <option value="Cash">
                                        Cash
                                    </option>

                                    <option value="UPI">
                                        UPI
                                    </option>

                                    <option value="Bank Transfer">
                                        Bank Transfer
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-800">
                                {filteredPayments.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-800">
                                {payments.length}
                            </span>{" "}
                            payments
                        </div>
                    </div>

                    {loading && payments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

                            <p className="mt-4 text-sm text-slate-500">
                                Loading payments...
                            </p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <div className="text-5xl mb-4">
                                💳
                            </div>

                            <h2 className="font-bold text-slate-800">
                                No payments found
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Try changing your search or filter.
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
                                                    Contractor
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Amount
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Method
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Date
                                                </th>

                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                    Notes
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {filteredPayments.map(
                                                (payment) => (
                                                    <tr
                                                        key={payment._id}
                                                        className="hover:bg-slate-50 transition"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-slate-800">
                                                                {payment
                                                                    .workerId
                                                                    ?.name ||
                                                                    "—"}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {payment
                                                                    .workerId
                                                                    ?.role ||
                                                                    ""}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-slate-700">
                                                                {payment
                                                                    .contractorId
                                                                    ?.name ||
                                                                    "—"}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {payment
                                                                    .contractorId
                                                                    ?.email ||
                                                                    ""}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-slate-800">
                                                                ₹
                                                                {Number(
                                                                    payment.amount ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getMethodClass(
                                                                    payment.paymentMethod
                                                                )}`}
                                                            >
                                                                {
                                                                    payment.paymentMethod
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            {payment.paymentDate
                                                                ? new Date(
                                                                      payment.paymentDate
                                                                  ).toLocaleDateString(
                                                                      "en-IN"
                                                                  )
                                                                : "—"}
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">
                                                            <p className="truncate">
                                                                {payment.notes ||
                                                                    "—"}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredPayments.map(
                                    (payment) => (
                                        <div
                                            key={payment._id}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h2 className="font-bold text-slate-800">
                                                        {payment
                                                            .workerId
                                                            ?.name ||
                                                            "Unknown Worker"}
                                                    </h2>

                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {payment
                                                            .workerId
                                                            ?.role ||
                                                            ""}
                                                    </p>
                                                </div>

                                                <span className="font-bold text-emerald-600">
                                                    ₹
                                                    {Number(
                                                        payment.amount ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Contractor
                                                    </p>

                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {payment
                                                            .contractorId
                                                            ?.name ||
                                                            "—"}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {payment
                                                            .contractorId
                                                            ?.email ||
                                                            ""}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs text-slate-400">
                                                            Payment Method
                                                        </p>

                                                        <span
                                                            className={`inline-flex mt-1 rounded-full px-3 py-1 text-xs font-semibold ${getMethodClass(
                                                                payment.paymentMethod
                                                            )}`}
                                                        >
                                                            {
                                                                payment.paymentMethod
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400">
                                                            Date
                                                        </p>

                                                        <p className="text-sm font-medium text-slate-700 mt-1">
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

                                                {payment.notes && (
                                                    <div>
                                                        <p className="text-xs text-slate-400">
                                                            Notes
                                                        </p>

                                                        <p className="text-sm text-slate-600 mt-1">
                                                            {
                                                                payment.notes
                                                            }
                                                        </p>
                                                    </div>
                                                )}
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

export default AdminPayments;