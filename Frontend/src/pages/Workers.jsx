import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const Workers = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const [workers, setWorkers] = useState([]);
    const [sites, setSites] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);

    const [search, setSearch] = useState("");
    const [siteFilter, setSiteFilter] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        role: "Labourer",
        dailyWage: "",
        joiningDate: "",
        siteId: "",
        status: "Active"
    });


    const fetchWorkers = async () => {
        try {
            setLoading(true);

            const response = await api.get("/workers");

            setWorkers(response.data.workers || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to fetch workers"
            );
        } finally {
            setLoading(false);
        }
    };


    const fetchSites = async () => {
        try {
            const response = await api.get("/sites");

            setSites(response.data.sites || []);
        } catch (error) {
            console.error("Failed to fetch sites:", error);
        }
    };

    useEffect(() => {
        fetchWorkers();
        fetchSites();
    }, []);


    const resetForm = () => {
        setFormData({
            name: "",
            phone: "",
            role: "Labourer",
            dailyWage: "",
            joiningDate: "",
            siteId: "",
            status: "Active"
        });

        setEditingWorker(null);
        setShowForm(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
                role: formData.role,
                dailyWage: Number(formData.dailyWage),
                joiningDate: formData.joiningDate || undefined,
                siteId: formData.siteId,
                status: formData.status
            };

            if (editingWorker) {
                await api.put(
                    `/workers/${editingWorker._id}`,
                    payload
                );
            } else {
                await api.post("/workers", payload);
            }

            resetForm();
            fetchWorkers();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to save worker"
            );
        }
    };


    const handleEdit = (worker) => {
        setEditingWorker(worker);

        setFormData({
            name: worker.name || "",
            phone: worker.phone || "",
            role: worker.role || "Labourer",
            dailyWage: worker.dailyWage || "",
            joiningDate: worker.joiningDate
                ? worker.joiningDate.substring(0, 10)
                : "",
            siteId: worker.siteId?._id || "",
            status: worker.status || "Active"
        });

        setShowForm(true);
    };


    const handleDeactivate = async (workerId) => {
        const confirmed = window.confirm(
            "Mark this worker as inactive?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/workers/${workerId}`);

            fetchWorkers();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to update worker"
            );
        }
    };


    const filteredWorkers = workers.filter((worker) => {

        const matchesSearch =
            worker.name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            worker.phone
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            worker.role
                ?.toLowerCase()
                .includes(search.toLowerCase());

        const matchesSite =
            !siteFilter ||
            worker.siteId?._id === siteFilter;

        return matchesSearch && matchesSite;
    });

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
                            Management
                        </p>

                        <h1 className="font-bold text-slate-900">
                            Workers
                        </h1>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
                    >
                        + Add Worker
                    </button>

                </header>

                <main className="p-4 sm:p-6 lg:p-8">

                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-slate-900">
                            Workforce
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Manage workers, roles and daily wages
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <input
                                type="text"
                                placeholder="Search by name, phone or role..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="form-input"
                            />

                            <select
                                value={siteFilter}
                                onChange={(e) =>
                                    setSiteFilter(e.target.value)
                                }
                                className="form-input"
                            >
                                <option value="">
                                    All Sites
                                </option>

                                {sites.map((site) => (
                                    <option
                                        key={site._id}
                                        value={site._id}
                                    >
                                        {site.siteName}
                                    </option>
                                ))}
                            </select>

                        </div>

                    </div>

                    {showForm && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">

                            <div className="flex justify-between items-center mb-6">

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {editingWorker
                                            ? "Edit Worker"
                                            : "Add New Worker"}
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Enter worker information
                                    </p>
                                </div>

                                <button
                                    onClick={resetForm}
                                    className="text-xl text-slate-400 hover:text-slate-700"
                                >
                                    ×
                                </button>

                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                            >

                                <div>
                                    <label className="form-label">
                                        Worker Name
                                    </label>

                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Example: Ravi Kumar"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Phone
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone number"
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Role
                                    </label>

                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="Mason">
                                            Mason
                                        </option>

                                        <option value="Labourer">
                                            Labourer
                                        </option>

                                        <option value="Electrician">
                                            Electrician
                                        </option>

                                        <option value="Plumber">
                                            Plumber
                                        </option>

                                        <option value="Carpenter">
                                            Carpenter
                                        </option>

                                        <option value="Painter">
                                            Painter
                                        </option>

                                        <option value="Welder">
                                            Welder
                                        </option>

                                        <option value="Helper">
                                            Helper
                                        </option>

                                        <option value="Supervisor">
                                            Supervisor
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">
                                        Daily Wage
                                    </label>

                                    <input
                                        type="number"
                                        name="dailyWage"
                                        value={formData.dailyWage}
                                        onChange={handleChange}
                                        placeholder="Example: 700"
                                        min="1"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Construction Site
                                    </label>

                                    <select
                                        name="siteId"
                                        value={formData.siteId}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    >
                                        <option value="">
                                            Select a site
                                        </option>

                                        {sites
                                            .filter(
                                                site =>
                                                    site.status ===
                                                    "Active"
                                            )
                                            .map((site) => (
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
                                    <label className="form-label">
                                        Joining Date
                                    </label>

                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>

                                {editingWorker && (
                                    <div>
                                        <label className="form-label">
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="form-input"
                                        >
                                            <option value="Active">
                                                Active
                                            </option>

                                            <option value="Inactive">
                                                Inactive
                                            </option>
                                        </select>
                                    </div>
                                )}

                                <div className="md:col-span-2 flex gap-3">

                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                                    >
                                        {editingWorker
                                            ? "Update Worker"
                                            : "Create Worker"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold"
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </form>

                        </div>
                    )}

                    {loading ? (

                        <div className="bg-white rounded-2xl p-10 text-center">

                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                            <p className="text-sm text-slate-500 mt-4">
                                Loading workers...
                            </p>

                        </div>

                    ) : filteredWorkers.length === 0 ? (

                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

                            <div className="text-5xl">
                                👷
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mt-4">
                                No workers found
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Add workers to start managing your workforce.
                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                            {filteredWorkers.map((worker) => (

                                <div
                                    key={worker._id}
                                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                                >

                                    <div className="flex items-start justify-between">

                                        <div className="flex items-center gap-3">

                                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                                                {worker.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase()}
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-slate-900">
                                                    {worker.name}
                                                </h3>

                                                <p className="text-sm text-slate-500">
                                                    {worker.role}
                                                </p>
                                            </div>

                                        </div>

                                        <span
                                            className={`
                                                px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${
                                                    worker.status ===
                                                    "Active"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-slate-100 text-slate-500"
                                                }
                                            `}
                                        >
                                            {worker.status}
                                        </span>

                                    </div>

                                    <div className="mt-6 space-y-3">

                                        <div className="flex justify-between text-sm">

                                            <span className="text-slate-500">
                                                Site
                                            </span>

                                            <span className="font-medium text-slate-900 text-right">
                                                {worker.siteId?.siteName ||
                                                    "No site"}
                                            </span>

                                        </div>

                                        <div className="flex justify-between text-sm">

                                            <span className="text-slate-500">
                                                Daily Wage
                                            </span>

                                            <span className="font-bold text-slate-900">
                                                ₹{Number(
                                                    worker.dailyWage
                                                ).toLocaleString("en-IN")}
                                            </span>

                                        </div>

                                        {worker.phone && (
                                            <div className="flex justify-between text-sm">

                                                <span className="text-slate-500">
                                                    Phone
                                                </span>

                                                <span className="font-medium text-slate-900">
                                                    {worker.phone}
                                                </span>

                                            </div>
                                        )}

                                    </div>

                                    <div className="flex gap-2 mt-6 pt-5 border-t border-slate-100">

                                        <button
                                            onClick={() =>
                                                handleEdit(worker)
                                            }
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold"
                                        >
                                            Edit
                                        </button>

                                        {worker.status === "Active" && (
                                            <button
                                                onClick={() =>
                                                    handleDeactivate(
                                                        worker._id
                                                    )
                                                }
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-semibold"
                                            >
                                                Inactivate
                                            </button>
                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </main>

            </div>

        </div>
    );
};

export default Workers;