// src/components/LoginModal.jsx
import { useState } from "react";
import { useToast } from "../Providers/ToastProvider";
import Allapi from "../common";

function LoginModal({ onClose, onLogin }) {
  const toastMsg = useToast();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  // shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup only
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      toastMsg("error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(Allapi.auth.register.url, { // Updated to match new Allapi structure if needed; assuming auth nested
        method: Allapi.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        toastMsg("error", data.message || "Signup failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      toastMsg("success", data.message);
      onLogin(data.user.role);
      onClose();
    } catch (err) {
      console.error(err);
      toastMsg("error", "Signup error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(Allapi.auth.login.url,
        {
          method: Allapi.auth.login.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        toastMsg("error", data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      toastMsg("success", data.message);
      onLogin(data.user.role);
      onClose();
    } catch (err) {
      console.error(err);
      toastMsg("error", "Login error");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/google/callback')}&response_type=code&scope=email profile`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">×</button>
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ARC Print</h2>
          {isSignup ? (
            <p className="text-gray-600">Festive Vibes Med Fashion Make This Winter Merrier with Custom Jackets and Hoods</p>
          ) : (
            <p className="text-gray-600">Sign in</p>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password *"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={isSignup ? handleSignup : handleLogin}
          disabled={loading}
          className="w-full mt-6 bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : (isSignup ? "Create Account" : "Sign in")}
        </button>

        {/* Forgot Password */}
        {!isSignup && (
          <a href="#" className="block text-center text-sm text-red-600 mt-2">Forgot password?</a>
        )}

        {/* OR Divider */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-300" />
          <span className="flex-shrink-0 px-4 text-sm text-gray-400 bg-white">or</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        {/* Google Button */}
        <button
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-pink-500 hover:underline"
          >
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;