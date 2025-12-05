import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaNotesMedical,
  FaDumbbell,
  FaFileAlt,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Dashboard"); 

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (onToggle) onToggle(!isOpen);
  };

  const navTabs = [
    { icon: <FaTachometerAlt />, label: "Dashboard" },
    { icon: <FaCalendarAlt />, label: "Schedule" },
    { icon: <FaNotesMedical />, label: "Medical Records" },
    { icon: <FaDumbbell />, label: "Rehab Plan" },
    { icon: <FaFileAlt />, label: "Reports" },
  ];

  const footerTabs = [
    { icon: <FaUserCircle />, label: "Profile" },
    { icon: <FaSignOutAlt />, label: "Sign Out" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="sidebar-header">
        {isOpen && <div className="sidebar-logo">Montu Core</div>}

        <div
          className="sidebar-toggle"
          onClick={toggleSidebar}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12H20" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 18H20" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div className="sidebar-tabs">
        {navTabs.map((tab, idx) => (
          <div
            key={idx}
            className={`tab-item ${selectedTab === tab.label ? "selected" : ""}`}
            onClick={() => setSelectedTab(tab.label)}
          >
            <div className="tab-icon">{tab.icon}</div>
            {isOpen && <span className="tab-label">{tab.label}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {footerTabs.map((tab, idx) => (
          <div
            key={idx}
            className={`tab-item ${selectedTab === tab.label ? "selected" : ""}`}
            onClick={() => setSelectedTab(tab.label)}
          >
            <div className="tab-icon">{tab.icon}</div>
            {isOpen && <span className="tab-label">{tab.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
