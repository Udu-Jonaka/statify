"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FaHeadphones,
  FaHome,
  FaMusic,
  FaMicrophone,
  FaListOl,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";
import "@/styles/sidebar.css";

const Sidebar = ({ user }) => {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: <FaHome /> },
    { name: "Top Songs", href: "/top-songs", icon: <FaMusic /> },
    { name: "Top Artists", href: "/top-artists", icon: <FaMicrophone /> },
    { name: "Top 100", href: "/top-100", icon: <FaListOl /> },
    { name: "History", href: "/history", icon: <FaHistory /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebarLogo">
        <span className="logoIcon">
          <FaHeadphones />
        </span>
        Statify
      </div>

      <nav className="sidebarNav">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`sidebarLink ${isActive ? "active" : ""}`}
            >
              <span className="sidebarIcon">{link.icon}</span>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="sidebarFooter">
          <div className="userProfile">
            {user.image ? (
              <Image
                src={user.image}
                alt={`${user.name || "User"}'s profile`}
                width={40}
                height={40}
                className="userAvatar"
              />
            ) : (
              <div
                className="userAvatar"
                style={{ backgroundColor: "var(--color-surface-3)" }}
              />
            )}
            <div className="userInfo">
              <span className="userName">{user.name || "Guest"}</span>
              <span className="userStatus">Online</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="logoutButton"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
