import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const Payments = () => {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState("");

    const [summary, setSummary] = useState(null);
    const [payments, setPayments] = useState([]);

    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [notes, setNotes] = useState("");

    const [loadingWorkers, setLoadingWorkers] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchWorkers = async () => {
        try {
            setLoadingWorkers(true);

            const response = await api.get("/workers");

            const activeWorkers = (response.data.workers || []).filter(
                (worker) => worker.status === "Active"
            );

            setWorkers(activeWorkers);
        } catch (error) {
            console.error(error);
            setError("Failed to load workers");
        } finally {
            setLoadingWorkers(false);
        }
    };

    const fetchWorkerData = async (workerId) => {
        if (!workerId) {
            setSummary(null);
            setPayments([]);
            return;
        }

        try {
            setLoadingSummary(true);
            setError("");

            const [wageResponse, paymentResponse] = await Promise.all([
                api.get(`/wages/worker/${workerId}`),
                api.get(`/payments/worker/${workerId}`)
            ]);

            const data = wageResponse.data;

            setSummary({
                ...data,

                presentDays: data.attendance?.presentDays ?? 0,
                halfDays: data.attendance?.halfDays ?? 0,
                absentDays: data.attendance?.absentDays ?? 0,

                presentEarnings:
                    data.earnings?.presentEarnings ?? 0,

                halfDayEarnings:
                    data.earnings?.halfDayEarnings ?? 0,

                totalEarned:
                    data.earnings?.totalEarned ?? 0,

                totalPaid:
                    data.payments?.totalPaid ?? 0,

                pendingAmount:
                    data.payments?.pendingAmount ?? 0
            });

            setPayments(paymentResponse.data.payments || []);
        } catch (error) {
            console.error(error);
            setError(
                error.response?.data?.message ||
                "Failed to load payment details"
            );
            setSummary(null);
            setPayments([]);
        } finally {
            setLoadingSummary(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    useEffect(() => {
        fetchWorkerData(selectedWorker);
    }, [selectedWorker]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!selectedWorker) {
            setError("Please select a worker");
            return;
        }

        const paymentAmount = Number(amount);

        if (!paymentAmount || paymentAmount <= 0) {
            setError("Please enter a valid payment amount");
            return;
        }

        const pendingAmount = Number(summary?.pendingAmount || 0);

        if (paymentAmount > pendingAmount) {
            setError(
                `Payment cannot exceed pending amount of ₹${pendingAmount.toLocaleString()}`
            );
            return;
        }

        try {
            setSubmitting(true);

            await api.post("/payments", {
                workerId: selectedWorker,
                amount: paymentAmount,
                paymentMethod,
                notes
            });

            setSuccess("Payment recorded successfully!");

            setAmount("");
            setNotes("");

            await fetchWorkerData(selectedWorker);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to record payment"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const selectedWorkerData = workers.find(
        (worker) => worker._id === selectedWorker
    );

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Payments
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Record worker payments and track payment history
                        </p>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {success}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                        <label className="form-label">
                            Select Worker
                        </label>

                        <select
                            value={selectedWorker}
                            onChange={(e) => {
                                setSelectedWorker(e.target.value);
                                setSuccess("");
                                setError("");
                            }}
                            className="form-input"
                            disabled={loadingWorkers}
                        >
                            <option value="">
                                {loadingWorkers
                                    ? "Loading workers..."
                                    : "Select a worker"}
                            </option>

                            {workers.map((worker) => (
                                <option
                                    key={worker._id}
                                    value={worker._id}
                                >
                                    {worker.name} - {worker.role}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loadingSummary && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                            <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

                            <p className="mt-3 text-sm text-slate-500">
                                Loading payment details...
                            </p>
                        </div>
                    )}

                    {!loadingSummary && summary && (
                        <>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">
                                            {summary.worker?.name ||
                                                selectedWorkerData?.name}
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            {summary.worker?.role ||
                                                selectedWorkerData?.role}
                                        </p>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-xs text-slate-500">
                                            Daily Wage
                                        </p>

                                        <p className="text-lg font-bold text-slate-800">
                                            ₹
                                            {Number(
                                                summary.worker?.dailyWage ||
                                                0
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <p className="text-sm text-slate-500">
                                        Total Earned
                                    </p>

                                    <p className="text-2xl font-bold text-slate-800 mt-2">
                                        ₹
                                        {Number(
                                            summary.totalEarned || 0
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <p className="text-sm text-slate-500">
                                        Already Paid
                                    </p>

                                    <p className="text-2xl font-bold text-emerald-600 mt-2">
                                        ₹
                                        {Number(
                                            summary.totalPaid || 0
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <p className="text-sm text-slate-500">
                                        Pending Amount
                                    </p>

                                    <p className="text-2xl font-bold text-amber-600 mt-2">
                                        ₹
                                        {Number(
                                            summary.pendingAmount || 0
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <p className="text-sm text-slate-500">
                                        Present Days
                                    </p>

                                    <p className="text-2xl font-bold text-blue-600 mt-2">
                                        {summary.presentDays || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <div className="mb-5">
                                        <h2 className="text-lg font-bold text-slate-800">
                                            Record Payment
                                        </h2>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Add a payment for the selected
                                            worker
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="form-label">
                                                Payment Amount
                                            </label>

                                            <div >

                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={summary.pendingAmount}
                                                    step="0.01"
                                                    value={amount}
                                                    onChange={(e) =>
                                                        setAmount(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter amount"
                                                    className="form-input pl-9"
                                                />
                                            </div>

                                            <p className="text-xs text-slate-500 mt-2">
                                                Maximum payable: ₹
                                                {Number(
                                                    summary.pendingAmount || 0
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="form-label">
                                                Payment Method
                                            </label>

                                            <select
                                                value={paymentMethod}
                                                onChange={(e) =>
                                                    setPaymentMethod(
                                                        e.target.value
                                                    )
                                                }
                                                className="form-input"
                                            >
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

                                        <div>
                                            <label className="form-label">
                                                Notes
                                            </label>

                                            <textarea
                                                value={notes}
                                                onChange={(e) =>
                                                    setNotes(e.target.value)
                                                }
                                                rows="3"
                                                placeholder="Optional payment notes"
                                                className="form-input resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={
                                                submitting ||
                                                Number(
                                                    summary.pendingAmount || 0
                                                ) <= 0
                                            }
                                            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                                        >
                                            {submitting
                                                ? "Recording Payment..."
                                                : "Record Payment"}
                                        </button>

                                        {Number(
                                            summary.pendingAmount || 0
                                        ) <= 0 && (
                                                <p className="text-center text-sm text-emerald-600 font-medium">
                                                    ✓ No pending payment for this
                                                    worker
                                                </p>
                                            )}
                                    </form>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <div className="mb-5">
                                        <h2 className="text-lg font-bold text-slate-800">
                                            Payment History
                                        </h2>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Previous payments made to this
                                            worker
                                        </p>
                                    </div>

                                    {payments.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <div className="text-4xl mb-3">
                                                💳
                                            </div>

                                            <p className="font-medium text-slate-700">
                                                No payments yet
                                            </p>

                                            <p className="text-sm text-slate-500 mt-1">
                                                Payment history will appear
                                                here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[450px] overflow-y-auto">
                                            {payments.map((payment) => (
                                                <div
                                                    key={payment._id}
                                                    className="border border-slate-200 rounded-xl p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                ₹
                                                                {Number(
                                                                    payment.amount ||
                                                                    0
                                                                ).toLocaleString()}
                                                            </p>

                                                            <p className="text-sm text-slate-500 mt-1">
                                                                {payment.paymentMethod}
                                                            </p>
                                                        </div>

                                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                            Paid
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                                        <p className="text-xs text-slate-500">
                                                            {payment.paymentDate
                                                                ? new Date(
                                                                    payment.paymentDate
                                                                ).toLocaleDateString(
                                                                    "en-IN"
                                                                )
                                                                : "Date unavailable"}
                                                        </p>

                                                        {payment.notes && (
                                                            <p className="text-sm text-slate-600 mt-1">
                                                                {
                                                                    payment.notes
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {!loadingSummary && !summary && !selectedWorker && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                            <div className="text-5xl mb-4">💰</div>

                            <h2 className="text-lg font-bold text-slate-800">
                                Select a worker
                            </h2>

                            <p className="text-sm text-slate-500 mt-2">
                                Select a worker above to view earnings and
                                record payments.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Payments;