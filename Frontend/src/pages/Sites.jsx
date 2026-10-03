import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";



const Sites = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingSite, setEditingSite] = useState(null);

    const [formData, setFormData] = useState({
        siteName: "",
        location: "",
        clientName: "",
        startDate: "",
        status: "Active"
    });

    const fetchSites = async () => {
        try {
            setLoading(true);

            const response = await api.get("/sites");

            setSites(response.data.sites || []);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to fetch sites"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSites();
    }, []);

    const resetForm = () => {
        setFormData({
            siteName: "",
            location: "",
            clientName: "",
            startDate: "",
            status: "Active"
        });

        setEditingSite(null);
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
            if (editingSite) {
                await api.put(
                    `/sites/${editingSite._id}`,
                    formData
                );
            } else {
                await api.post("/sites", formData);
            }

            resetForm();
            fetchSites();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to save site"
            );
        }
    };

    const handleEdit = (site) => {
        setEditingSite(site);

        setFormData({
            siteName: site.siteName || "",
            location: site.location || "",
            clientName: site.clientName || "",
            startDate: site.startDate
                ? site.startDate.substring(0, 10)
                : "",
            status: site.status || "Active"
        });

        setShowForm(true);
    };

    const handleDelete = async (siteId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this site?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/sites/${siteId}`);

            fetchSites();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to delete site"
            );
        }
    };

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
                            Construction Sites
                        </h1>
                    </div>

                    <button
                        onClick={() => {
                            setEditingSite(null);
                            setFormData({
                                siteName: "",
                                location: "",
                                clientName: "",
                                startDate: "",
                                status: "Active"
                            });
                            setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
                    >
                        + Add Site
                    </button>

                </header>

                <main className="p-4 sm:p-6 lg:p-8">

                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-slate-900">
                            Sites
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Manage your construction projects
                        </p>

                    </div>

                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                            {error}
                        </div>
                    )}

                    {showForm && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">

                            <div className="flex items-center justify-between mb-6">

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {editingSite
                                            ? "Edit Site"
                                            : "Add New Site"}
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Enter construction site details
                                    </p>
                                </div>

                                <button
                                    onClick={resetForm}
                                    className="text-slate-400 hover:text-slate-700 text-xl"
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
                                        Site Name
                                    </label>

                                    <input
                                        name="siteName"
                                        value={formData.siteName}
                                        onChange={handleChange}
                                        placeholder="Example: Green Valley Apartments"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Location
                                    </label>

                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Example: Hyderabad"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Client Name
                                    </label>

                                    <input
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        placeholder="Client / Company"
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>

                                {editingSite && (
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

                                            <option value="Completed">
                                                Completed
                                            </option>

                                            <option value="On Hold">
                                                On Hold
                                            </option>
                                        </select>
                                    </div>
                                )}

                                <div className="md:col-span-2 flex gap-3">

                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                                    >
                                        {editingSite
                                            ? "Update Site"
                                            : "Create Site"}
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
                                Loading sites...
                            </p>
                        </div>

                    ) : sites.length === 0 ? (

                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

                            <div className="text-5xl">
                                🏗️
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mt-4">
                                No sites yet
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Create your first construction site.
                            </p>

                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold"
                            >
                                + Add Site
                            </button>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                            {sites.map((site) => (

                                <div
                                    key={site._id}
                                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                                >

                                    <div className="flex items-start justify-between">

                                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                                            🏗️
                                        </div>

                                        <span
                                            className={`
                                                px-3 py-1 rounded-full text-xs font-semibold
                                                ${
                                                    site.status === "Active"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : site.status === "Completed"
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "bg-amber-50 text-amber-600"
                                                }
                                            `}
                                        >
                                            {site.status}
                                        </span>

                                    </div>

                                    <h3 className="font-bold text-slate-900 text-lg mt-5">
                                        {site.siteName}
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-2">
                                        📍 {site.location}
                                    </p>

                                    {site.clientName && (
                                        <p className="text-sm text-slate-500 mt-2">
                                            Client: {site.clientName}
                                        </p>
                                    )}

                                    {site.startDate && (
                                        <p className="text-xs text-slate-400 mt-4">
                                            Started:{" "}
                                            {new Date(
                                                site.startDate
                                            ).toLocaleDateString("en-IN")}
                                        </p>
                                    )}

                                    <div className="flex gap-2 mt-6 pt-5 border-t border-slate-100">

                                        <button
                                            onClick={() => handleEdit(site)}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(site._id)}
                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-semibold"
                                        >
                                            Delete
                                        </button>

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

export default Sites;