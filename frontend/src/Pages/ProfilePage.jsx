import { useState } from "react";
import useUser from "../hooks/useUser";
import { useToast } from "../Providers/ToastProvider";
import Allapi from "../common";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const { user, token } = useUser();
  const toastMsg = useToast();
    const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!user) return <div className="p-6 min-h-screen bg-gradient-to-b from-white to-blue-50 pt-16">Not logged in</div>;

  const handleSave = async () => {
    if (saving) return;
    console.log("name:",name);
    if (password && password !== confirmPassword) {
      toastMsg("error", "Passwords do not match");
      return;
    }

    const payload = {};
    if (name !== user.name) payload.name = name;
    if (password) payload.password = password;

    if (Object.keys(payload).length === 0) {
      toastMsg("error", "No changes made");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(Allapi.user.update.url, {
        method: Allapi.user.update.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("update date",data)
      if (!data.success) {
        toastMsg("error", data.message || "Update failed");
        return;
      }

      localStorage.setItem("userdetails", JSON.stringify(data.user));

      toastMsg("success", "Profile updated");

      setEditing(false);
      setPassword("");
      setConfirmPassword("");

      window.location.reload();
    } catch (err) {
      toastMsg("error", "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-6 pt-20">
        <div className="w-full h-16 flex items-center px-4 md:px-8">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors duration-300"
        >
          <span className="text-blue-600 text-xl font-bold">←</span>
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-800">Back</h1>
      </div>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Profile</h1>

        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white font-bold text-xl">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            {!editing && (
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            )}
          </div>

          {!editing ? (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">E</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">N</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-800">{user.name}</p>
                  </div>
                </div>
              </div>

              <button
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>

                <button
                  className="flex-1 py-3 px-4 bg-gray-400 text-white font-semibold rounded-xl hover:bg-gray-500 transition-all duration-200"
                  onClick={() => {
                    setEditing(false);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;