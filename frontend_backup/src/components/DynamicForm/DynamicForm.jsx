// DynamicForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./DynamicForm.css";

export default function DynamicForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
const [toast, setToast] = useState({ message: "", visible: false });

  // Detect whether we're editing a device or a user
  const isDevice = location.pathname.includes("/device");
  const API_BASE = isDevice
    ? "http://localhost:5000/api/devices"
    : "http://localhost:5000/api/users";

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing data if updating
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/${id}`)
      .then((res) => {
        const data = res.data.device || res.data.user || res.data;
        setFormData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to fetch details");
        setLoading(false);
      });
  }, [id, API_BASE]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit form (POST or PUT)
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const method = id ? "put" : "post";
    const url = id ? `${API_BASE}/${id}` : API_BASE;

    const res = await axios[method](url, formData);

    // Show toast
    setToast({ message: res.data.message || "Operation successful!", visible: true });

    // After 2 seconds, navigate back
    setTimeout(() => {
      setToast({ message: "", visible: false });
      const from = location.state?.from || (isDevice ? "/devices" : "/users");
      navigate(from);
    }, 2000);
  } catch (err) {
    console.error("Error submitting form:", err);
    setError(err.response?.data?.message || "Submit failed!");
  } finally {
    setLoading(false);
  }
};



  if (loading) return <p>Loading...</p>;

  // Determine back page for Cancel button
  const backPage = location.state?.from || (isDevice ? "/devices" : "/users");

  return (
    <div className="dynamic-form-container">
      <h2>
        {id
          ? isDevice
            ? "Update Device"
            : "Update User"
          : isDevice
          ? "Add Device"
          : "Add User"}
      </h2>

      <form onSubmit={handleSubmit}>
        {isDevice ? (
          <>
            <label>Name*</label>
            <input
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />

            <label>Location</label>
            <input
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
            />

            <label>Device ID*</label>
            <input
              name="device_id"
              value={formData.device_id || ""}
              onChange={handleChange}
              required
            />

            <label>Tank Shape*</label>
            <select
              name="tank_shape"
              value={formData.tank_shape || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Shape</option>
              <option value="cylindrical">Cylindrical</option>
              <option value="rectangular">Rectangular</option>
              <option value="square">Square</option>
            </select>

            <label>Tank Radius (cm)</label>
            <input
              type="number"
              name="tank_radius"
              value={formData.tank_radius || ""}
              onChange={handleChange}
            />

            <label>Sensor Height Bottom (cm)</label>
            <input
              type="number"
              name="sensor_height_bottom"
              value={formData.sensor_height_bottom || ""}
              onChange={handleChange}
            />

            <label>Reading When Full (cm)</label>
            <input
              type="number"
              name="reading_when_full"
              value={formData.reading_when_full || ""}
              onChange={handleChange}
            />

            <label>Tank Width (cm)</label>
            <input
              type="number"
              name="tank_width"
              value={formData.tank_width || ""}
              onChange={handleChange}
            />

            <label>Tank Length (cm)</label>
            <input
              type="number"
              name="tank_length"
              value={formData.tank_length || ""}
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <label>Full Name*</label>
            <input
              name="full_name"
              value={formData.full_name || ""}
              onChange={handleChange}
              required
            />

            <label>Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              required
            />

            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
            />

            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={!!formData.is_active}
                onChange={handleChange}
              />{" "}
              Active
            </label>
          </>
        )}

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit">{id ? "Update" : "Add"}</button>
          <button type="button" onClick={() => navigate(backPage)}>
            Cancel
          </button>
        </div>
      </form>
      {toast.visible && (
  <div className="toast-notification">
    {toast.message}
  </div>
)}

    </div>
  );
}
