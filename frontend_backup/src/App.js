import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./components/LoginSignup/LoginSignup";
import DeviceList from "./components/DeviceList/DeviceList";
import DynamicForm from "./components/DynamicForm/DynamicForm";
import DeviceDetail from "./components/DeviceDetail/DeviceDetail";
import Dashboard from "./components/Dashboard/Dashboard";
import UsersTable from "./components/UsersTable/UsersTable";
import UserDetail from "./components/UserDetail/UserDetail";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginSignup />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <PrivateRoute>
              <DeviceList />
            </PrivateRoute>
          }
        />
        <Route
          path="/device-form/:id?"
          element={
            <PrivateRoute>
              <DynamicForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/update-user/:id?"
          element={
            <PrivateRoute>
              <DynamicForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/devices/:id"
          element={
            <PrivateRoute>
              <DeviceDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersTable />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <PrivateRoute>
              <UserDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
