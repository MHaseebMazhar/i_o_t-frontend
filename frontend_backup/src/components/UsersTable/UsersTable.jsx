import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UsersTable.css";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        if (res.data.success) {
          setUsers(res.data.users);
        } else {
          console.error("Failed:", res.data.message);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

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
      [id]: index >= totalRows - 2 ? "ut-dropdown-above" : "ut-dropdown-below",
    });
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleAction = (action, user) => {
    if (action === "update") {
      navigate(`/update-user/${user.user_id}`);
    } else if (action === "delete") {
      if (window.confirm(`Are you sure you want to delete ${user.full_name}?`)) {
        axios
          .delete(`http://localhost:5000/api/users/${user.user_id}`)
          .then(() => {
            alert("User deleted successfully!");
            setUsers(users.filter((u) => u.user_id !== user.user_id));
          })
          .catch((err) =>
            alert(err.response?.data?.message || "Delete failed!")
          );
      }
    } else if (action === "detail") {
      navigate(`/users/${user.user_id}`);
    }
  };

  return (
    <div className="ut-container">
      <div className="ut-topbar">
        <h2 className="ut-topbar-title">Users List</h2>

        <div className="ut-top-buttons">
          <button
            className="ut-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/", { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="ut-table-wrapper">
        <table className="ut-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Is Active</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u, index) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.is_active ? "Yes" : "No"}</td>
                <td>{new Date(u.updated_at).toLocaleString()}</td>

                <td>
                  <div
                    className="ut-action-menu"
                    ref={u.user_id === openMenuId ? menuRef : null}
                  >
                    <span
                      className="ut-menu-dot"
                      onClick={() =>
                        handleMenuToggle(u.user_id, index, users.length)
                      }
                    >
                      &#x22EE;
                    </span>

                    {openMenuId === u.user_id && (
                      <div
                        className={`ut-dropdown ${
                          dropdownPosition[u.user_id] || "ut-dropdown-below"
                        }`}
                      >
                        <div
                          className="ut-dropdown-item"
                          onClick={() => handleAction("update", u)}
                        >
                          Update
                        </div>

                        <div
                          className="ut-dropdown-item"
                          onClick={() => handleAction("delete", u)}
                        >
                          Delete
                        </div>

                        <div
                          className="ut-dropdown-item"
                          onClick={() => handleAction("detail", u)}
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
      </div>
    </div>
  );
}
