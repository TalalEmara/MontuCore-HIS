import React, { useState } from "react";
import { FaTachometerAlt,FaCalendarAlt,FaUserInjured,FaSignOutAlt,FaFileMedical,FaMicroscope,FaRunning,FaClipboardList} from "react-icons/fa";
import { useLocation, useNavigate } from "@tanstack/react-router";
import "./Sidebar.css";

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const currentRole = currentPath.split("/")[1];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (onToggle) onToggle(!isOpen);
  };

  const physicianTabs = [
    { icon: <FaTachometerAlt />, label: "Dashboard", to: "/physician" },
    { icon: <FaCalendarAlt />, label: "Appointments", to: "/physician/schedule" },
    { icon: <FaUserInjured />, label: "Cases", to: "/physician/cases" },
    { icon: <FaFileMedical />, label: "Lab Tests", to: "/physician/labs" }, 
    { icon: <FaMicroscope />, label: "Imaging", to: "/physician/imaging" }, 
  ];

  const physioTabs = [
    { icon: <FaTachometerAlt />, label: "Dashboard", to: "/physio" },
    { icon: <FaCalendarAlt />, label: "Appointments", to: "/physio/schedule" },
    { icon: <FaUserInjured />, label: "Cases", to: "/physio/cases" },
    { icon: <FaRunning />, label: "Physio Progress", to: "/physio/progress" },
  ];

  const athleteTabs = [
    { icon: <FaTachometerAlt />, label: "Dashboard", to: "/athlete" },
    { icon: <FaCalendarAlt />, label: "Appointments", to: "/athlete/schedule" },
    { icon: <FaClipboardList />, label: "My Records", to: "/athlete/records" }, 
  ];

  let navTabs = athleteTabs; 
  if (currentRole === "physician") navTabs = physicianTabs;
  else if (currentRole === "physio") navTabs = physioTabs;

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="sidebar-header">
        {isOpen && <div className="sidebar-logo">MontuCore</div>}
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="sidebar-tabs">
        {navTabs.map((tab, idx) => (
          <div
            key={idx}
            className={`tab-item ${currentPath === tab.to ? "selected" : ""}`}
            onClick={() => navigate({ to: tab.to })}
          >
            <div className="tab-icon">{tab.icon}</div>
            {isOpen && <span className="tab-label">{tab.label}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
       
        <div 
          className="tab-item"
          onClick={() => navigate({ to: "/login" })}
        >
          <div className="tab-icon"><FaSignOutAlt /></div>
          {isOpen && <span className="tab-label">Sign Out</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;