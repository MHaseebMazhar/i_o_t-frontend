import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";

export default function LoginSignup() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/signup", { name, email, password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);

        navigate("/dashboard");
      } else {
        setMessage("Login failed");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>{mode === "login" ? "Login" : "Signup"}</h2>

      {mode === "signup" && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="login-input"
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
      />

      <button
        onClick={mode === "login" ? handleLogin : handleSignup}
        className="login-button"
      >
        {mode === "login" ? "Login" : "Signup"}
      </button>

      <p className="login-toggle">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
          {mode === "login" ? "Signup" : "Login"}
        </span>
      </p>

      {message && (
        <p className={message.toLowerCase().includes("failed") ? "login-error" : "login-message"}>
          {message}
        </p>
      )}
    </div>
  );
}
