import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DeviceList.css";

export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000/api/devices";

  // Bind Device Modal states
  const [bindModalOpen, setBindModalOpen] = useState(false);
  const [bindDevice, setBindDevice] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // =========================
  // Format dates helper
  // =========================
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  // =========================
  // Fetch devices on mount
  // =========================
  useEffect(() => {
    axios
      .get(API_BASE)
      .then((res) => {
        setDevices(res.data.devices || []);
      })
      .catch((err) => {
        console.error("Error fetching devices:", err);
        if (err.response?.status === 401) navigate("/");
      });
  }, [navigate]);

  // =========================
  // Close action menu on outside click
  // =========================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================
  // Toggle action menu
  // =========================
  const handleMenuToggle = (id, index, totalRows) => {
    setDropdownPosition({
      [id]: index >= totalRows - 2 ? "dd-above" : "dd-below",
    });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  // =========================
  // Handle CRUD actions
  // =========================
  const handleAction = (action, device) => {
    if (action === "update") navigate(`/device-form/${device.id}`);
    else if (action === "detail") navigate(`/devices/${device.id}`);
    else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this device?")) {
        axios
          .delete(`${API_BASE}/${device.id}`)
          .then(() => {
            alert("Device deleted successfully!");
            setDevices(devices.filter((d) => d.id !== device.id));
          })
          .catch((err) => alert(err.response?.data?.message || err.message));
      }
    }
  };

  // =========================
  // Open Bind Device Modal
  // =========================
  const openBindModal = (device) => {
    setBindDevice(device);
    setSelectedUserId(null);
    setBindModalOpen(true);

    axios
      .get("http://localhost:5000/api/users")
      .then((res) => setUsersList(res.data.users || []))
      .catch((err) => console.error(err));
  };

  // =========================
  // Close Bind Modal
  // =========================
  const closeBindModal = () => {
    setBindModalOpen(false);
    setBindDevice(null);
    setSelectedUserId(null);
  };

  // =========================
  // Bind device to selected user
  // =========================
  const handleBindDevice = async () => {
    try {
      if (!selectedUserId) return alert("Select a user first!");

      console.log("Binding device", bindDevice.id, "to user", selectedUserId);

      const res = await axios.post(
        `http://localhost:5000/api/devices/${bindDevice.id}/bind`,
        { userId: selectedUserId } // send number to server
      );

      alert(res.data.message);

      // Close modal and refresh device list
      closeBindModal();
      const devicesRes = await axios.get("http://localhost:5000/api/devices");
      setDevices(devicesRes.data.devices || []);
    } catch (err) {
      console.error("Bind device error:", err);
      alert(err.response?.data?.message || err.message);
    }
  };
  // =========================
  // Render component
  // =========================
  return (
    <div className="dl-container">
      {/* Top Bar */}
      <div className="dl-topbar">
        <h2>📟 Device List</h2>
        <div className="dl-topbuttons">
          <button
            className="dl-addbtn"
            onClick={() => navigate("/device-form")}
          >
            AddNewDevice
          </button>
          <button
            className="dl-logoutbtn"
            onClick={() => {
              localStorage.removeItem("token"); // same as dashboard
              navigate("/", { replace: true }); // prevent back
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Devices Table */}
      <div className="dl-tablewrapper">
        <table className="dl-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Device ID</th>
              <th>IOT User ID</th>
              <th>Tank Shape</th>
              <th>Tank Radius</th>
              <th>Sensor Height Bottom</th>
              <th>Reading When Full</th>
              <th>Tank Width</th>
              <th>Tank Length</th>
              <th>Updated At</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d, index) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.location}</td>
                <td>{d.device_id}</td>
                <td>{d.iot_user_id}</td>
                <td>{d.tank_shape}</td>
                <td>{d.tank_radius}</td>
                <td>{d.sensor_height_bottom}</td>
                <td>{d.reading_when_full}</td>
                <td>{d.tank_width}</td>
                <td>{d.tank_length}</td>
                <td>{formatDate(d.updated_at)}</td>
                <td>{formatDate(d.created_at)}</td>
                <td>
                  {/* Action Menu */}
                  <div
                    className="dl-actionmenu"
                    ref={d.id === openMenuId ? menuRef : null}
                  >
                    <span
                      className="dl-menudot"
                      onClick={() =>
                        handleMenuToggle(d.id, index, devices.length)
                      }
                    >
                      &#x22EE;
                    </span>
                    {openMenuId === d.id && (
                      <div
                        className={`dl-menudropdown ${
                          dropdownPosition[d.id] || "dd-below"
                        }`}
                      >
                        <div
                          className="dl-menuitem"
                          onClick={() => handleAction("update", d)}
                        >
                          Update
                        </div>
                        <div
                          className="dl-menuitem"
                          onClick={() => handleAction("detail", d)}
                        >
                          Details
                        </div>
                        <div
                          className="dl-menuitem"
                          onClick={() => openBindModal(d)}
                        >
                          Bind Device
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* =========================
            Bind Device Modal
           ========================= */}
        {bindModalOpen && (
          <div className="dl-bindmodal">
            <h3>Bind Device: {bindDevice?.name}</h3>

            {/* Current User */}
            <p>
              Current User:{" "}
              {bindDevice?.iot_user_id
                ? usersList.find(
                    (u) => u.user_id === Number(bindDevice.iot_user_id)
                  )?.full_name || "Unknown"
                : "None"}
            </p>

            {/* User Dropdown */}
            <div className="dl-userlist">
              <select
                className="dl-select"
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value="">Select User</option>
                {usersList.map((user) => {
                  const userIdNum = Number(user.user_id);
                  const currentUserId = Number(bindDevice?.iot_user_id);

                  // Disable option if it's the current user
                  const isCurrentUser = userIdNum === currentUserId;

                  return (
                    <option
                      key={`user-${userIdNum}`}
                      value={userIdNum}
                      disabled={isCurrentUser} // can't select current user
                    >
                      {user.full_name}
                      {isCurrentUser ? " (Already Bind)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Modal Buttons */}
            <div className="dl-modalactions">
              <button onClick={closeBindModal}>Cancel</button>

              <button
                onClick={handleBindDevice}
                disabled={!selectedUserId}
                style={{ background: "#28a745", color: "#fff" }}
              >
                Bind
              </button>


            </div>
          </div>
        )}
      </div>
    </div>
  );
}
