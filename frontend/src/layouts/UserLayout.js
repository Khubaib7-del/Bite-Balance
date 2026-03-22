import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/Layout.css';

const UserLayout = ({ children, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className="bb-layout">
      {/* Header */}
      <Navbar toggleSidebar={window.innerWidth < 900 ? toggleMobileSidebar : toggleSidebar} />

      {/* Sidebar */}
      <Sidebar 
        onLogout={onLogout} 
        collapsed={isSidebarCollapsed} 
        showMobile={showMobileSidebar} 
        toggleMobile={toggleMobileSidebar}
      />

      {/* Content Area */}
      <main className={`bb-main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
