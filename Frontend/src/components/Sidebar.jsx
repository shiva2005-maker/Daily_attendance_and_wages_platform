import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();

    const contractorLinks = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: "📊"
        },
        {
            name: "Sites",
            path: "/sites",
            icon: "🏗️"
        },
        {
            name: "Workers",
            path: "/workers",
            icon: "👷"
        },
        {
            name: "Attendance",
            path: "/attendance",
            icon: "📅"
        },
        {
            name: "Wages",
            path: "/wages",
            icon: "💰"
        },
        {
            name: "Payments",
            path: "/payments",
            icon: "💳"
        },
        {
            name: "Reports",
            path: "/reports",
            icon: "📈"
        }
    ];

    const adminLinks = [
        {
            name: "Admin Dashboard",
            path: "/admin",
            icon: "📊"
        },
        {
            name: "Contractors",
            path: "/admin/contractors",
            icon: "👥"
        },
        {
            name: "Workers",
            path: "/admin/workers",
            icon: "👷"
        },
        {
            name: "Sites",
            path: "/admin/sites",
            icon: "🏗️"
        },
        {
            name: "Payments",
            path: "/admin/payments",
            icon: "💳"
        }
    ];

    const links =
        user?.role === "admin"
            ? adminLinks
            : contractorLinks;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            {/* =========================
                MOBILE TOP BAR
            ========================== */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 text-white z-40 flex items-center justify-between px-4 shadow-lg">
                <div>
                    <h1 className="font-bold text-lg">
                        WageTrack
                    </h1>

                    <p className="text-[11px] text-slate-400">
                        Labour Management
                    </p>
                </div>

                <button
                    onClick={() => setMobileOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 text-2xl"
                >
                    ☰
                </button>
            </div>

            {/* =========================
                MOBILE OVERLAY
            ========================== */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                />
            )}

            {/* =========================
                SIDEBAR
            ========================== */}
            <aside
                className={`
                    fixed
                    top-0
                    left-0
                    h-screen
                    w-64
                    bg-slate-950
                    text-white
                    z-50
                    flex
                    flex-col
                    shadow-2xl

                    transform
                    transition-transform
                    duration-300

                    md:translate-x-0

                    ${
                        mobileOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >
                {/* =========================
                    LOGO HEADER
                ========================== */}
                <div className="h-20 shrink-0 px-6 flex items-center justify-between border-b border-slate-800">
                    <div>
                        <h1 className="text-xl font-bold">
                            WageTrack
                        </h1>

                        <p className="text-xs text-slate-400 mt-1">
                            Labour Management
                        </p>
                    </div>

                    {/* Mobile Close */}
                    <button
                        onClick={() =>
                            setMobileOpen(false)
                        }
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* =========================
                    USER INFO
                ========================== */}
                <div className="shrink-0 px-4 py-4 border-b border-slate-800">
                    <div className="bg-slate-800 rounded-xl p-3">
                        <p className="text-sm font-semibold truncate">
                            {user?.name || "User"}
                        </p>

                        <p className="text-xs text-slate-400 truncate mt-1">
                            {user?.email || ""}
                        </p>

                        <span
                            className={`
                                inline-block
                                mt-2
                                px-2.5
                                py-1
                                rounded-full
                                text-[11px]
                                font-semibold

                                ${
                                    user?.role === "admin"
                                        ? "bg-purple-500/20 text-purple-300"
                                        : "bg-blue-500/20 text-blue-300"
                                }
                            `}
                        >
                            {user?.role === "admin"
                                ? "Administrator"
                                : "Contractor"}
                        </span>
                    </div>
                </div>

                {/* =========================
                    NAVIGATION
                ========================== */}
                <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-3 mb-3">
                        {user?.role === "admin"
                            ? "Admin Menu"
                            : "Main Menu"}
                    </p>

                    <div className="space-y-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={
                                    link.path === "/admin" ||
                                    link.path === "/dashboard"
                                }
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                                className={({ isActive }) =>
                                    `
                                    flex
                                    items-center
                                    gap-3
                                    px-3
                                    py-3
                                    rounded-xl
                                    text-sm
                                    font-medium
                                    transition

                                    ${
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }
                                    `
                                }
                            >
                                <span className="w-6 text-center text-lg">
                                    {link.icon}
                                </span>

                                <span>
                                    {link.name}
                                </span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* =========================
                    LOGOUT
                ========================== */}
                <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-950">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
                    >
                        <span className="w-6 text-center text-lg">
                            🚪
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;