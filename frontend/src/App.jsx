import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./Pages/LoginPage";
import UserPanel from "./Pages/UserPanel";
import AdminPanel from "./Pages/AdminPanel";
import GoogleCallback from "./Components/GoogleCallback";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      {/* Toast container (only once globally) */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

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

        <Route path="/google/callback" element={<GoogleCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
