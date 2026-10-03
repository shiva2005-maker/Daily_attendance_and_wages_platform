import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Sites from "./pages/Sites";
import Workers from "./pages/Workers";
import Attendance from "./pages/Attendance";
import Wages from "./pages/Wages";
import Payments from "./pages/Payments";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import AdminContractors from "./pages/AdminContractors";
import AdminWorkers from "./pages/AdminWorkers";
import AdminSites from "./pages/AdminSites";
import AdminPayments from "./pages/AdminPayments";
import Reports from "./pages/Reports";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public */}
                <Route path="/" element={<Login />} />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Protected */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sites"
                    element={
                        <ProtectedRoute>
                            <Sites />
                        </ProtectedRoute>
                    } />

                <Route path="/workers"
                    element={
                        <ProtectedRoute>
                            <Workers />
                        </ProtectedRoute>
                    } />

                <Route path="/attendance"
                    element={
                        <ProtectedRoute>
                            <Attendance />
                        </ProtectedRoute>
                    } />

                <Route path="wages"
                    element={
                        <ProtectedRoute>
                            <Wages />
                        </ProtectedRoute>
                    } />

                <Route path="/payments"
                    element={
                        <ProtectedRoute>
                            <Payments />
                        </ProtectedRoute>
                    } />

                <Route path="/reports"
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />

                <Route path="/admin"
                    element={<AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>} />

                <Route path="/admin/contractors"
                    element={
                        <AdminRoute>
                            <AdminContractors />
                        </AdminRoute>
                    } />
                <Route path="/admin/workers"
                    element={
                        <AdminRoute>
                            <AdminWorkers />
                        </AdminRoute>
                    } />
                <Route path="/admin/sites"
                    element={
                        <AdminRoute>
                            <AdminSites />
                        </AdminRoute>
                    } />

                <Route path="/admin/payments"
                    element={
                        <AdminRoute>
                            <AdminPayments />
                        </AdminRoute>
                    } />


            </Routes>

        </BrowserRouter>
    );
}

export default App;