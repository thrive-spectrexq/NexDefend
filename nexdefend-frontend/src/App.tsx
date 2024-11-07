// src/App.tsx
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Alerts from "./components/Alerts";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import Home from "./components/Home";
import IncidentReport from "./components/IncidentReport";
import IOCScan from "./components/IOCScan";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ThreatDetection from "./components/ThreatDetection";
import Upload from "./components/Upload";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="App-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/threat-detection" element={<ProtectedRoute element={ThreatDetection} />} />
            <Route path="/alerts" element={<ProtectedRoute element={Alerts} />} />
            <Route path="/upload" element={<ProtectedRoute element={Upload} />} />
            <Route path="/incident-report" element={<ProtectedRoute element={IncidentReport} />} />
            <Route path="/ioc-scan" element={<ProtectedRoute element={IOCScan} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
