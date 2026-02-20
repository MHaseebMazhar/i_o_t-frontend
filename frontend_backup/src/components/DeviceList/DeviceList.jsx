import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DeviceList.css";

export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

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
  // Fetch devices
  // =========================
  const fetchDevices = async (page = 1) => {
    try {
      const res = await axios.get(`${API_BASE}/api/getAllDevices?page=${page}`);
      const data = res.data.data;
      setDevices(data.data || []);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (err) {
      console.error("Error fetching devices:", err);
      if (err.response?.status === 401) navigate("/");
    }
  };

  useEffect(() => {
    fetchDevices(currentPage);
  }, [currentPage]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuToggle = (id, index, totalRows) => {
    setDropdownPosition({
      [id]: index >= totalRows - 2 ? "dd-above" : "dd-below",
    });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleAction = (action, device) => {
  if (action === "update") {
    navigate(`/device-form/${device.id}`, { state: { device } });
  } else if (action === "detail") {
    navigate(`/devices/${device.id}`);
  } else if (action === "delete") {
    if (window.confirm("Are you sure you want to delete this device?")) {
      axios
        .delete(`${API_BASE}/api/devices/${device.id}`)
        .then(() => {
          alert("Device deleted successfully!");
          fetchDevices(currentPage);
        })
        .catch((err) => alert(err.response?.data?.message || err.message));
    }
  }
};


  const openBindModal = (device) => {
    setBindDevice(device);
    setSelectedUserId(null);
    setBindModalOpen(true);

    axios
      .get(`${API_BASE}/api/users`)
      .then((res) => setUsersList(res.data.users || []))
      .catch((err) => console.error(err));
  };

  const closeBindModal = () => {
    setBindModalOpen(false);
    setBindDevice(null);
    setSelectedUserId(null);
  };

  const handleBindDevice = async () => {
    if (!selectedUserId) return alert("Select a user first!");

    try {
      const res = await axios.post(
        `${API_BASE}/api/devices/${bindDevice.id}/bind`,
        { userId: selectedUserId }
      );

      alert(res.data.message);
      closeBindModal();
      fetchDevices(currentPage);
    } catch (err) {
      console.error("Bind device error:", err);
      alert(err.response?.data?.message || err.message);
    }
  };
  return (
    <div className="dl-container">
      <div className="dl-topbar">
        <h2>📟 Device List</h2>
        <div className="dl-topbuttons">
          <button className="dl-addbtn" onClick={() => navigate("/device-form")}>
            AddNewDevice
          </button>
          <button
            className="dl-logoutbtn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/", { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="dl-tablewrapper">
        <table className="dl-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Device ID</th>
              <th>User Name</th>
              <th>Shape</th>
              <th>Configuration</th>
              <th>Sensor Height Bottom</th>
              <th>Reading When Full</th>
              <th>Level</th>
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
                <td>{d.user_name || "-"}</td>
                <td>{d.tank_shape}</td>
                <td>
                  <div style={{ lineHeight: "18px" }}>
                    {d.tank_width ? <div><strong>W:</strong> {d.tank_width}</div> : null}
                    {d.tank_length ? <div><strong>L:</strong> {d.tank_length}</div> : null}
                    {d.tank_radius ? <div><strong>R:</strong> {d.tank_radius}</div> : null}

                    {!d.tank_width && !d.tank_length && !d.tank_radius && (
                      <div>-</div>
                    )}
                  </div>
                </td>

                <td>{d.sensor_height_bottom}</td>
                <td>{d.reading_when_full}</td>
                <td>{d.percentage ? `${parseFloat(d.percentage).toFixed(0)}%` : "-"}</td>
                <td>
                  <div className="dl-actionmenu" ref={d.id === openMenuId ? menuRef : null}>
                    <span
                      className="dl-menudot"
                      onClick={() => handleMenuToggle(d.id, index, devices.length)}
                    >
                      &#x22EE;
                    </span>
                    {openMenuId === d.id && (
                      <div className={`dl-menudropdown ${dropdownPosition[d.id] || "dd-below"}`}>
                        <div className="dl-menuitem" onClick={() => handleAction("update", d)}>
                          Update
                        </div>
                        <div className="dl-menuitem" onClick={() => handleAction("detail", d)}>
                          Details
                        </div>
                        <div className="dl-menuitem" onClick={() => openBindModal(d)}>
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



        {bindModalOpen && (
          <div className="dl-bindmodal">
            <h3>Bind Device: {bindDevice?.name}</h3>
            <p>
              Current User:{" "}
              {bindDevice?.iot_user_id
                ? usersList.find((u) => u.user_id === Number(bindDevice.iot_user_id))
                  ?.full_name || "Unknown"
                : "None"}
            </p>

            <select
              className="dl-select"
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              <option value="">Select User</option>
              {usersList.map((user) => {
                const userIdNum = Number(user.user_id);
                const isCurrentUser = userIdNum === Number(bindDevice?.iot_user_id);
                return (
                  <option key={`user-${userIdNum}`} value={userIdNum} disabled={isCurrentUser}>
                    {user.full_name} {isCurrentUser ? "(Already Bind)" : ""}
                  </option>
                );
              })}
            </select>

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
