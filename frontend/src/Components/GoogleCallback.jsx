import { useToast } from "../Providers/ToastProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Allapi from "../common";
import logotext from "../assets/logo.png";

function GoogleCallback() {
  const toastMsg = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = new URLSearchParams(location.search).get("code");
    if (!code) {
      toastMsg("error", "No authorization code from Google");
      navigate("/login", { replace: true });
      return;
    }

    fetch(Allapi.auth.google.url, {
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
        localStorage.setItem("userdetails", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);
        toastMsg("success", data.message);

        // 🔥 Read redirect URL from localStorage (set by LoginPage)
        const redirectFromStorage = localStorage.getItem("redirectAfterLogin");
        localStorage.removeItem("redirectAfterLogin");


      const redirectTo = 
          data.user.role === "admin"
            ? "/admin"
            : redirectFromStorage || "/";

        console.log("Redirecting to:", redirectTo);
        navigate(redirectTo, { replace: true });
      })
      .catch(() => {
        toastMsg("error", "Authentication error");
        navigate("/login", { replace: true });
      });
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50">
      <img src={logotext} alt="PrintMaania" className="h-40 w-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-700">Logging... in with Google</h2>
    </div>
  );
}

export default GoogleCallback;