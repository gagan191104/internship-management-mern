import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import EmployerPanel from "./pages/EmployerPanel";
import InternshipList from "./pages/InternshipList";
import Apply from "./pages/Apply";
import PendingApproval from "./pages/PendingApproval";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerPostings from "./pages/employer/EmployerPostings";
import EmployerApplications from "./pages/employer/EmployerApplications";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/internships" element={<InternshipList />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/pending-approval"
          element={
            <ProtectedRoute>
              <PendingApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]} requireVerified>
              <Apply />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={["employer"]} requireVerified>
              <EmployerPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employer"]} requireVerified>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/postings"
          element={
            <ProtectedRoute allowedRoles={["employer"]} requireVerified>
              <EmployerPostings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applications"
          element={
            <ProtectedRoute allowedRoles={["employer"]} requireVerified>
              <EmployerApplications />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
