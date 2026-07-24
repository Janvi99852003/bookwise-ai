import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardLayout from "./pages/DashboardLayout";
import Overview from "./pages/Overview";
import Services from "./pages/Services";
import Availability from "./pages/Availability";
import Bookings from "./pages/Bookings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="services" element={<Services />} />
            <Route path="availability" element={<Availability />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>

          {/* Day 5 will add the public /book/:slug page here */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;