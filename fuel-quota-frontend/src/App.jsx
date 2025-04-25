import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./pages/userVehicleregistration/VehicleRegistration";
import UserLogin from "./pages/userLogin/UserLogin";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect the root path to /register */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </Router>
  );
}

export default App;
