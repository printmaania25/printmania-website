import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import UserPanel from "./Pages/UserPanel";
import AdminPanel from "./Pages/AdminPanel";
import GoogleCallback from "./Components/GoogleCallback";  // Import the missing component

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/user"
          element={token && role === "user" ? <UserPanel /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={token && role === "admin" ? <AdminPanel /> : <Navigate to="/login" />}
        />

        {/* Add this route for Google OAuth callback */}
        <Route path="/google/callback" element={<GoogleCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;