import { useToast } from "../Providers/ToastProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Allapi from "../common";

function GoogleCallback() {
  const toastMsg = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const calledRef = useRef(false); // 🔥 Prevent double effect call

  useEffect(() => {
    if (calledRef.current) return;  // skip second StrictMode call
    calledRef.current = true;

    const code = new URLSearchParams(location.search).get("code");
    if (!code) {
      toastMsg("error", "No authorization code from Google");
      navigate("/login", { replace: true });
      return;
    }

    fetch(Allapi.auth.google, {
      method: Allapi.auth.google.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          toastMsg("error", data.message || "Google login failed");
          return navigate("/login", { replace: true });
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        toastMsg("success", data.message);
        navigate(data.user.role === "admin" ? "/admin" : "/user", { replace: true });
      })
      .catch(() => {
        toastMsg("error", "Authentication error");
        navigate("/login", { replace: true });
      });
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <h2 className="text-lg font-semibold text-gray-700">Logging in with Google...</h2>
    </div>
  );
}

export default GoogleCallback;
