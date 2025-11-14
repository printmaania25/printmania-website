// src/Pages/GoogleCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";  // For programmatic navigation
import Allapi from "../common";

function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      console.error("Google returned no code");
      navigate("/login");  // Redirect to login on error
      return;
    }

    // send the auth code to backend
    fetch(Allapi.google.url, {
      method: Allapi.google.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }), // code goes to backend
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.token) {
          console.error("Backend returned no token");
          alert(data.message || "Google login failed");
          navigate("/login");
          return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        navigate(data.user.role === "admin" ? "/admin" : "/user");  // Use navigate instead of window.location
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Google login error");
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Logging in with Google...</h1>
        <p className="text-gray-500">Please wait a moment.</p>
      </div>
    </div>
  );
}

export default GoogleCallback;