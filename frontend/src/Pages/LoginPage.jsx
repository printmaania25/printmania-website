// src/Pages/LoginPage.jsx
import { useState } from "react";
import Allapi from "../common";

function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);

  // shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup only
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ---------------- SIGNUP -------------------
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(Allapi.signup.url, {
        method: Allapi.signup.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        window.location.href = "/user";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Signup error");
    }
  };

  // ---------------- LOGIN -------------------
  const handleLogin = async () => {
    try {
      const res = await fetch(Allapi.login.url, {
        method: Allapi.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        window.location.href = data.user.role === "admin" ? "/admin" : "/user";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login error");
    }
  };

  // ---------------- GOOGLE LOGIN -------------------
  const googleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent("http://localhost:5173/google/callback");
    const scope = encodeURIComponent("openid email profile");
    const googleURL =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` + // IMPORTANT: code flow
      `&scope=${scope}` +
      `&access_type=offline` +
      `&prompt=select_account`;

    window.location.href = googleURL;
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header with toggle tabs */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex border-b border-blue-500/30">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-3 px-4 text-center transition-all duration-200 ${
                !isSignup
                  ? "border-b-2 border-white font-semibold text-white"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-3 px-4 text-center transition-all duration-200 ${
                isSignup
                  ? "border-b-2 border-white font-semibold text-white"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form container */}
        <div className="p-6 space-y-4">
          {/* Name field for signup only */}
          {isSignup && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password for signup only */}
          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {/* Submit Button */}
          {!isSignup ? (
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={handleSignup}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Create Account
            </button>
          )}

          {/* OR divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300" />
            <span className="flex-shrink-0 px-4 text-sm text-gray-400 bg-white">or</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          {/* Google Login Button */}
          <button
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;