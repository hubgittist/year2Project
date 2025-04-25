import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function handleAccountSettings() {
    setOpen(false);
    navigate("/account/settings");
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700 focus:outline-none hover:ring-2 hover:ring-blue-400 transition"
        title="Account actions"
        onClick={() => setOpen((v) => !v)}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
        )}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-blue-100 animate-fade-in">
          <button
            className="block w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-50"
            onClick={handleAccountSettings}
          >
            Account Settings
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-blue-50"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
