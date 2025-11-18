// DeviceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import "./DeviceDetail.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [series, setSeries] = useState([]);
  const [readings, setReadings] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rawReadings, setRawReadings] = useState([]);

  const API_BASE = "http://localhost:5000/api/devices";

  useEffect(() => {
    setSeries([
      {
        name: "Water Level (%)",
        data: readings,
      },
    ]);
  }, [readings]);

  useEffect(() => {
    const fetchDeviceAndReadings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/${id}`);
        setDevice(res.data.device);

        // fetch last 24 hours by default
        const readingsRes = await axios.get(
          `${API_BASE}/${id}/readings?start=${new Date(
            new Date().getTime() - 24 * 60 * 60 * 1000
          ).toISOString()}&end=${new Date().toISOString()}`
        );
        const data = readingsRes.data.readings || [];
        const defaultStart = new Date(
          new Date().getTime() - 24 * 60 * 60 * 1000
        );
        const defaultEnd = new Date();
        setStartDate(defaultStart);
        setEndDate(defaultEnd);
        setRawReadings(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch device data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceAndReadings();
  }, [id]);

  const handleDateFilter = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates!");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE}/${id}/readings?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      const data = response.data.readings || response.data.data || [];
      if (!data.length) {
        alert("No data found for selected range!");
        setReadings([]);
        return;
      }

      // --- Use raw readings directly ---
      const seriesData = data.map((r) => ({
        x: new Date(r.updated_at),
        y: Number(r.percentage_full ?? r.value ?? 0),
      }));

      setReadings(seriesData);
      setRawReadings(data); // keep for tooltip exact value
    } catch (error) {
      console.error("Error filtering data:", error);
      alert("Error fetching filtered data!");
    }
  };

  const options = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "straight" },
    xaxis: {
      type: "datetime",
      min: startDate?.getTime(),
      max: endDate?.getTime(),
      tickAmount: 24, // 24 equal parts
      labels: {
        datetimeUTC: false,
        formatter: (val) => {
          return new Date(val).toLocaleTimeString([], {
            month: "short", // e.g., Nov
            day: "numeric", // e.g., 13
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      title: { text: "Water Level (%)" },
      labels: {
        formatter: (val) => `${Math.round(val)}%`,
      },
    },
    tooltip: {
      x: { format: "dd-MM-yyyy HH:mm" },
      y: {
        formatter: function (val, opts) {
          const index = opts.dataPointIndex;
          const hovered = series[0].data[index];
          if (!hovered) return val;

          // match real reading nearest to hovered point
          const raw = rawReadings.reduce((closest, r) => {
            const t = new Date(
              r.updated_at || r.timestamp || r.time || r.x
            ).getTime();
            const diff = Math.abs(t - hovered.x.getTime());
            if (!closest || diff < closest.diff) return { r, diff };
            return closest;
          }, null);

          if (!raw) return val;

          let exact = Number(
            raw.r.percentage_full ??
              raw.r.percentage ??
              raw.r.value ??
              raw.r.y ??
              0
          );
          return `${exact.toFixed(2)}%`;
        },
      },
    },
  };

  if (loading) return <p>Loading device details...</p>;
  if (!device) return <p>Device not found.</p>;

  return (
    <div className="Container">
      <div className="Heading">
        <h1>Water Tank Monitoring System</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
      </div>

      <div className="tank-water1">
        <div className="tank-visualization">
          <h2>Tank Visualization</h2>
          <hr />

          <div className="tank-image">
            <div className="tank-image-upper">
              <button></button>
            </div>
            <div
              className="tank-image-container"
              style={{ height: `${device.percentage_full ?? 0}%` }}
            >
              <svg
                className="waves"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
              >
                <defs>
                  <path
                    id="gentle-wave"
                    d="M-160 44c30 0 58-18 88-18s58 18 88 18
               58-18 88-18 58 18 88 18 v44h-352z"
                  />
                </defs>
                <g className="parallax">
                  <use
                    href="#gentle-wave"
                    x="48"
                    y="0"
                    fill="rgb(53,158,255)"
                  />
                  <use
                    href="#gentle-wave"
                    x="48"
                    y="3"
                    fill="rgb(39,134,223)"
                  />
                  <use
                    href="#gentle-wave"
                    x="48"
                    y="5"
                    fill="rgb(56,145,228)"
                  />
                  <use
                    href="#gentle-wave"
                    x="48"
                    y="7"
                    fill="rgb(46,154,255)"
                  />
                </g>
              </svg>
              <p className="tank-percentage">
                <b>{parseFloat(device.percentage_full ?? 0).toFixed(0)}%</b>
              </p>
            </div>
          </div>
        </div>

        <div className="tank-info">
          <h2>
            Tank Details Info ({device.name}{" "}
            {device.location ? `- ${device.location}` : ""})
          </h2>
          <hr />
          <p>
            <span>System Status:</span>
            <span
              className={device.is_online ? "status-online" : "status-offline"}
            >
              {device.is_online ? "Online" : "Offline"}
            </span>
            {/* Only show unbind button if bound */}
            {device.iot_user_id ? (
              <button
                className="unbind-btn"
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Are you sure you want to unbind this device?"
                    )
                  )
                    return;

                  try {
                    const res = await axios.post(
                      `http://localhost:5000/api/devices/${device.id}/unbind`
                    );
                    alert(res.data.message);
                    setDevice({ ...device, iot_user_id: null });
                  } catch (err) {
                    console.error("Unbind error:", err);
                    alert(err.response?.data?.message || err.message);
                  }
                }}
                style={{
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  marginLeft: "47%", // align right properly
                }}
              >
                Unbind Device
              </button>
            ) : null}{" "}
            {/* Nothing shows if unbound */}
          </p>

          <p>
            <span>Sensor Reading:</span>
            <span>
              {readings[readings.length - 1]?.y ?? device.sensor_value ?? "-"}
            </span>
          </p>
          <p>
            <span>Water Height:</span>
            <span>{device.water_height_cm?.toFixed(2)} cm</span>
          </p>
          <p>
            <span>Percent Full:</span>
            <span>{device.percentage_full?.toFixed(2)}%</span>
          </p>
          <p>
            <span>Tank Volume:</span>
            <span>{device.tank_volume_liters?.toFixed(2)} L</span>
          </p>
          <p>
            <span>Max Capacity:</span>
            <span>{device.maxCapacity?.toFixed(2)} L</span>
          </p>
          <p>
            <span>Last Updated:</span>
            <span>{new Date(device.updated_at).toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="tank-water2">
        <h2>Data</h2>
        <div className="date-filter">
          <label>Start:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={5}
            dateFormat="dd-MM-yyyy HH:mm"
            placeholderText="Select start date & time"
            maxDate={new Date()}
          />
          <label>End:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={5}
            dateFormat="dd-MM-yyyy HH:mm"
            placeholderText="Select end date & time"
            minDate={startDate}
            maxDate={new Date()}
          />
          <button onClick={handleDateFilter} className="filter-btn1">
            Apply Filter
          </button>
        </div>

        <hr />

        <div className="chart-container">
          <Chart options={options} series={series} type="area" height={350} />
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
