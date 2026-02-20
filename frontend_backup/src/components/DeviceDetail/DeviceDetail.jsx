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
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [chartData, setChartData] = useState({ series: [] });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Utility to get WiFi quality
  const getWifiQuality = (rssi) => {
    if (rssi >= -55) return "Excellent";
    if (rssi >= -65) return "Good";
    if (rssi >= -75) return "Low";
    return "Weak";
  };

  // Menu event handler
  const handleMenuClick = async (eventId) => {
    setMenuOpen(false);
    try {
      const payload = { device_id: device.device_id, event_id: eventId };
      const res = await axios.post(`http://119.159.147.162:8186/send-data`, payload);
      let response = res.data.ws_response;

      if (eventId === "2006") {
        try {
          const wifiData = JSON.parse(response);
          const quality = getWifiQuality(wifiData.signal);
          response = `SSID: ${wifiData.ssid}\nPASSWORD: ${wifiData.password}\nSIGNAL: ${quality}`;
        } catch (e) { console.error("WiFi parse error:", e); }
      }

      if (eventId === "2008") {
        try {
          const live = JSON.parse(response);
          response = `Sensor Value: ${live.sensor_value}`;
        } catch (e) { console.error("Live Data parse error:", e); }
      }

      alert(response);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  // Fetch device info and last 24h readings
  useEffect(() => {
    const fetchDeviceAndReadings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/devices/${id}`);
        const data = res.data.data;
        setDevice(data);

        // Default last 24h readings
        const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const end = new Date();
        setStartDate(start);
        setEndDate(end);

        const readingsRes = await axios.get(
          `${API_BASE}/api/devices/${id}/readings?start=${start.toISOString()}&end=${end.toISOString()}`
        );

        // Directly use chartData from API
        setChartData(readingsRes.data.chartData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch device data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceAndReadings();
  }, [id, API_BASE]);

  // Handle date filter
  const handleDateFilter = async () => {
    if (!startDate || !endDate) return alert("Please select both dates!");
    try {
      const res = await axios.get(
        `${API_BASE}/api/devices/${id}/readings?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );

      if (!res.data.readings.length) {
        alert("No data found for selected range!");
        setChartData({ series: [] });
        return;
      }

      setChartData(res.data.chartData); // <- directly use chartData
    } catch (err) {
      console.error(err);
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
      tickAmount: 24,
      labels: {
        datetimeUTC: false,
        formatter: (val) =>
          new Date(val).toLocaleTimeString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      title: { text: "Water Level (%)" },
      labels: { formatter: (val) => `${Math.round(val)}%` },
    },
    tooltip: {
      x: { format: "dd-MM-yyyy HH:mm" },
      y: {
        formatter: (val, opts) => {
          const index = opts.dataPointIndex;
          const point = chartData.series[0]?.data[index];
          if (!point) return val;
          return `${point.percentage}% (Water Height: ${point.waterHeight} cm, Volume: ${point.volume} L)`;
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
        <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>
      </div>

      <div className="tank-water1">
        <div className="tank-visualization">
          <h2>Tank Visualization</h2>
          <hr />
          <div className="menu-dot-container">
            <button className="menu-dot" onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
            {menuOpen && (
              <div className="menu-dropdown">
                <button onClick={() => handleMenuClick("2008")}>Live Data</button>
                <button onClick={() => handleMenuClick("2006")}>WiFi Data</button>
                <button onClick={() => handleMenuClick("2002")}>Restart Device</button>
                <button onClick={() => handleMenuClick("2004")}>Current Status</button>
              </div>
            )}
          </div>
          <div className="tank-image">
            <div
              className="tank-image-container"
              style={{ height: `${device.percentage ?? 0}%` }}
            >
              <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
                <defs>
                  <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                </defs>
                <g className="parallax">
                  <use href="#gentle-wave" x="48" y="0" fill="rgb(53,158,255)" />
                  <use href="#gentle-wave" x="48" y="3" fill="rgb(39,134,223)" />
                  <use href="#gentle-wave" x="48" y="5" fill="rgb(56,145,228)" />
                  <use href="#gentle-wave" x="48" y="7" fill="rgb(46,154,255)" />
                </g>
              </svg>
              <p className="tank-percentage"><b>{parseFloat(device.percentage ?? 0).toFixed(0)}%</b></p>
            </div>
          </div>
        </div>

        <div className="tank-info">
          <h2>Tank Details Info ({device.name} {device.location ? `- ${device.location}` : ""})</h2>
          <hr />
          <p><span>System Status:</span>
            <span className={device.is_online ? "status-online" : "status-offline"}>
              {device.is_online ? "Online" : "Offline"}
            </span>
          </p>
          <p><span>Sensor Reading:</span><span>{device.currentReading ?? "-"} cm</span></p>
          <p><span>Water Height:</span><span>{device.waterHeight} cm</span></p>
          <p><span>Percent Full:</span><span>{device.percentage} %</span></p>
          <p><span>Tank Volume:</span><span>{device.volume} L</span></p>
          <p><span>Max Capacity:</span><span>{device.maxCapacity} L</span></p>
          <p><span>Last Updated:</span><span>{device.last_update}</span></p>
        </div>
      </div>

      <div className="tank-water2">
        <h2>Data</h2>
        <div className="date-filter">
          <label>Start:</label>
          <DatePicker
            selected={startDate} onChange={(date) => setStartDate(date)}
            showTimeSelect timeFormat="HH:mm" timeIntervals={5} dateFormat="dd-MM-yyyy HH:mm"
            maxDate={new Date()} placeholderText="Select start date & time"
          />
          <label>End:</label>
          <DatePicker
            selected={endDate} onChange={(date) => setEndDate(date)}
            showTimeSelect timeFormat="HH:mm" timeIntervals={5} dateFormat="dd-MM-yyyy HH:mm"
            minDate={startDate} maxDate={new Date()}
          />
          <button onClick={handleDateFilter} className="filter-btn1">Apply Filter</button>
        </div>
        <hr />
        <div className="chart-container">
          <Chart
            options={options}
            series={chartData.series}
            type="area"
            height={350}
          />

        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
