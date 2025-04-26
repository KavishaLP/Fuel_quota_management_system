import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./pages/userVehicleregistration/VehicleRegistration";
import UserLogin from "./pages/userLogin/UserLogin";
import Dashboard from "./pages/dashboard/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect the root path to /register */}
        <Route path="/" element={<Navigate to="/user-register" replace />} />
        <Route path="/user-register" element={<RegisterForm />} />
        <Route path="/user-login" element={<UserLogin />} />
       
        <Route path="/user-dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
