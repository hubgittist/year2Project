import React, { useState, useEffect } from "react";

export default function AccountSettings() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch current profile
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFullName(data.fullName || "");
          setAvatarPreview(data.avatar ? `http://localhost:5000${data.avatar}` : null);
        }
      } catch {}
    }
    fetchProfile();
  }, []);

  function handleAvatarChange(e) {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const formData = new FormData();
    formData.append("fullName", fullName);
    if (password) formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profile updated!");
        if (data.user?.avatar) setAvatarPreview(`http://localhost:5000${data.user.avatar}`);
      } else {
        setMessage(data.message || "Failed to update profile");
      }
    } catch {
      setMessage("Failed to update profile");
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Account Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-blue-700 font-semibold mb-1">Full Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-blue-700 font-semibold mb-1">New Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Change password"
          />
        </div>
        <div>
          <label className="block text-blue-700 font-semibold mb-1">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          {avatarPreview && (
            <img src={avatarPreview} alt="avatar preview" className="mt-2 w-20 h-20 rounded-full object-cover" />
          )}
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow">
          Save Changes
        </button>
        {message && <div className="text-green-600 font-semibold mt-2">{message}</div>}
      </form>
    </div>
  );
}
