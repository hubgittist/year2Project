import React from "react";
import { useNavigate } from "react-router-dom";
import AccountDropdown from "./AccountDropdown";

export default function UserHeader({ user }) {
  // If no avatar, use initials fallback
  const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  return (
    <div className="flex items-center space-x-3 p-4">
      <AccountDropdown user={user} />
      <div className="flex flex-col justify-center">
        <div className="font-semibold text-lg text-blue-900 leading-tight">{user?.fullName}</div>
        <div className="text-blue-600 text-sm capitalize leading-tight">{user?.role}</div>
      </div>
    </div>
  );
}
