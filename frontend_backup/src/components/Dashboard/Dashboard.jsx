import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalDevices: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Dashboard API error:", err));
  }, []);

  // 🔹 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true }); // prevent going back
  };

  return (
    <div className="db-main-container">
      {/* 🔹 TOPBAR WITH LOGOUT BUTTON */}
      <div className="db-topbar">
        <button className="db-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <h1 className="db-dashboard-heading">Dashboard</h1>

      <div className="db-cards-wrapper">
        <div className="db-card" onClick={() => navigate("/devices")}>
          <div className="db-icon">📟</div>
          <h2 className="db-card-title">Devices</h2>
          <p className="db-card-text">Total Devices: {stats.totalDevices}</p>
        </div>

        <div className="db-card" onClick={() => navigate("/users")}>
          <div className="db-icon">👥</div>
          <h2 className="db-card-title">Users</h2>
          <p className="db-card-text">Total Users: {stats.totalUsers}</p>
          <p className="db-card-text">Active Users: {stats.activeUsers}</p>
          <p className="db-card-text">Inactive Users: {stats.inactiveUsers}</p>
        </div>
      </div>
    </div>
  );
}
