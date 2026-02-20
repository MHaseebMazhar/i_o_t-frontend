import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./UserDetail.css";
export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const [data, setData] = useState({ user: null, devices: [] });
  const [showNotifyBox, setShowNotifyBox] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const menuRef = useRef(null);
  useEffect(() => {
  function handleClickOutside(event) {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setOpenMenuId(null);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/users/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("API ERROR:", err));
  }, [id, API_BASE]);

  if (!data.user) return <h2 className="udp-loading">Loading...</h2>;

  // Handlers for buttons
  const handleBack = () => navigate(-1);
  const handleUpdatePassword = () => {
    if (!newPassword || !confirmPassword) {
      return alert("Please fill both fields");
    }
    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    axios
      .post(`${API_BASE}/api/users/${id}/change-password`, {
        newPassword,
      })
      .then((res) => {
        alert(res.data.message);
        setShowChangePassword(false);
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error updating password");
      });
  };

  const handleSendNotification = () => {
    if (!notifyTitle || !notifyMessage) {
      return alert("Please enter both title and message");
    }

    axios
      .post(`${API_BASE}/api/notify/send`, {
        userId: id,
        title: notifyTitle,
        message: notifyMessage,
      })
      .then((res) => {
        alert(res.data.message);
        setShowNotifyBox(false);
        setNotifyTitle("");
        setNotifyMessage("");
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error sending notification");
      });
  };
  const handleMenuToggle = (id, index, totalRows) => {
      const position = index >= totalRows - 2 ? "above" : "below";
    setDropdownPosition((prev) => ({
      ...prev,
      [id]: position
    }));
    
  setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleDeviceAction = (action, device) => {
    if (action === "update") {
      navigate(`/device-form/${device.id}`, { state: { from: `/users/${data.user.user_id}` } });
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this device?")) {
        axios
          .delete(`${API_BASE}/api/devices/${device.id}`)
          .then(() => {
            alert("Device deleted successfully!");
            setData({
              ...data,
              devices: data.devices.filter((d) => d.id !== device.id),
            });
          })
          .catch((err) => alert(err.response?.data?.message || err.message));
      }
    } else if (action === "detail") {
      navigate(`/devices/${device.id}`);
    }
  };

  return (
    <div className="udp-container">
      <div className="udp-buttons-container">
        <button className="udp-btn udp-back-btn" onClick={handleBack}>
          Back
        </button>
        <button
          className="udp-btn udp-change-password-btn"
          onClick={() => setShowChangePassword(!showChangePassword)}
        >
          {showChangePassword ? "Cancel" : "Change Password"}
        </button>
        <button
          className="udp-btn udp-notify-btn"
          onClick={() => setShowNotifyBox(true)}
        >
          Send Notification
        </button>
      </div>
      {showNotifyBox && (
        <div className="udp-notify-box">
          <h3>Send Notification</h3>

          <label>Title</label>
          <input
            type="text"
            value={notifyTitle}
            onChange={(e) => setNotifyTitle(e.target.value)}
            className="udp-input"
            placeholder="Enter title..."
          />

          <label>Message</label>
          <textarea
            value={notifyMessage}
            onChange={(e) => setNotifyMessage(e.target.value)}
            className="udp-textarea"
            placeholder="Enter notification message..."
          ></textarea>

          <div className="udp-notify-actions">
            <button
              className="udp-btn udp-cancel-btn"
              onClick={() => setShowNotifyBox(false)}
            >
              Cancel
            </button>

            <button
              className="udp-btn udp-send-btn"
              onClick={handleSendNotification}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {showChangePassword && (
        <div className="udp-password-box">
          <h3>Change Password</h3>

          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="udp-input"
            placeholder="Enter new password"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="udp-input"
            placeholder="Confirm new password"
          />

          <div className="udp-notify-actions">
            <button
              className="udp-btn udp-cancel-btn"
              onClick={() => setShowChangePassword(false)}
            >
              Cancel
            </button>
            <button
              className="udp-btn udp-send-btn"
              onClick={handleUpdatePassword}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <h1 className="udp-title">User Details</h1>

      <div className="udp-user-box">
        <p>
          <strong>ID:</strong> {data.user.user_id}
        </p>
        <p>
          <strong>Name:</strong> {data.user.full_name}
        </p>
        <p>
          <strong>Email:</strong> {data.user.email}
        </p>
        <p>
          <strong>Phone:</strong> {data.user.phone}
        </p>
        <p>
          <strong>Active:</strong> {data.user.is_active ? "Yes" : "No"}
        </p>
        <p>
          <strong>Updated:</strong>{" "}
          {new Date(data.user.updated_at).toLocaleString()}
        </p>
      </div>

      <h2 className="udp-subtitle">Assigned Devices</h2>

      {data.devices.length === 0 ? (
        <p className="udp-no-devices">No devices assigned to this user.</p>
      ) : (
        <table className="udp-device-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Device Name</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.devices.map((d, index) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.location}</td>
                <td>
                  <div className="user-action-menu">
                    <span
                      className="user-menu-dot"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuToggle(d.id, index, data.devices.length);
                      }}
                    >
                      &#x22EE;
                    </span>

                    {openMenuId === d.id && (
                      <div
                        className={`user-menu-dropdown ${dropdownPosition[d.id] === "above" ? "above" : "below"
                          }`}
                      >
                        <div
                          className="user-menu-item"
                          onClick={() => handleDeviceAction("update", d)}
                        >
                          Update
                        </div>

                        <div
                          className="user-menu-item"
                          onClick={() => handleDeviceAction("detail", d)}
                        >
                          Details
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
