import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import ApiConfiguration from "../settings/ApiConfiguration";

type NavLinkProps = {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
};

const NavLink = ({ href, icon, children, active, collapsed }: NavLinkProps) => {
  return (
    <Link href={href}>
      <a
        className={`flex items-center px-4 py-3 text-sm rounded-md mx-2 my-1 transition-colors ${
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-700 hover:bg-gray-100"
        } ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? String(children) : ""}
      >
        <span className="material-icons text-lg mr-3">{icon}</span>
        {!collapsed && children}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Set collapsed to true by default
  
  // Check local storage for sidebar state on component mount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === 'true');
    } else {
      // If no saved state, default to collapsed
      localStorage.setItem('sidebarCollapsed', 'true');
    }
  }, []);
  
  // Save sidebar state to local storage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b shadow-sm text-gray-800 p-4 flex items-center justify-between w-full fixed top-0 z-10">
        <button
          className="material-icons text-gray-600"
          onClick={toggleMobileSidebar}
        >
          menu
        </button>
        <div className="flex items-center">
          <span className="material-icons text-primary mr-2">insights</span>
          <h1 className="text-lg font-bold">SocialPulse AI</h1>
        </div>
        <button className="material-icons text-gray-600">account_circle</button>
      </div>

      {/* Sidebar for desktop */}
      <aside
        className={`bg-white border-r shadow-sm h-full transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } ${
          mobileOpen
            ? "fixed z-20 top-16 left-0 h-screen"
            : "hidden"
        } md:block flex-shrink-0`}
      >
        <div className={`p-4 border-b flex ${collapsed ? "justify-center" : "justify-between"} items-center`}>
          {!collapsed && (
            <h1 className="text-xl font-bold flex items-center text-gray-800">
              <span className="material-icons text-primary mr-2">insights</span>
              SocialPulse AI
            </h1>
          )}
          {collapsed && (
            <span className="material-icons text-primary">insights</span>
          )}
          <button 
            onClick={toggleCollapsed} 
            className="material-icons text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "chevron_right" : "chevron_left"}
          </button>
        </div>

        <div className={`overflow-y-auto h-[calc(100%-180px)] py-4 ${collapsed ? "px-1" : "px-2"}`}>
          <nav>
            {!collapsed && (
              <div className="px-4 py-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Main Menu
              </div>
            )}
            <NavLink href="/" icon="dashboard" active={location === "/"} collapsed={collapsed}>
              Dashboard
            </NavLink>
            <NavLink href="/history" icon="history" active={location === "/history"} collapsed={collapsed}>
              History
            </NavLink>
            <NavLink href="/profiles" icon="person" active={location === "/profiles"} collapsed={collapsed}>
              Profiles
            </NavLink>
            <NavLink href="/settings" icon="settings" active={location === "/settings"} collapsed={collapsed}>
              Settings
            </NavLink>

            {!collapsed && (
              <div className="px-4 py-2 mt-6 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Analytics
              </div>
            )}
            {collapsed && <div className="my-6 border-t border-gray-100"></div>}
            <NavLink href="/trends" icon="trending_up" active={location === "/trends"} collapsed={collapsed}>
              Trends
            </NavLink>
            <NavLink
              href="/influencers"
              icon="group"
              active={location === "/influencers"}
              collapsed={collapsed}
            >
              Influencers
            </NavLink>
            <NavLink href="/reports" icon="bar_chart" active={location === "/reports"} collapsed={collapsed}>
              Reports
            </NavLink>
            
            {!collapsed && (
              <div className="px-4 py-2 mt-6 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Tools
              </div>
            )}
            {collapsed && <div className="my-6 border-t border-gray-100"></div>}
            <NavLink href="/export" icon="download" active={location === "/export"} collapsed={collapsed}>
              Export Tools
            </NavLink>
            <NavLink href="/alerts" icon="notifications" active={location === "/alerts"} collapsed={collapsed}>
              Alerts
            </NavLink>
          </nav>
        </div>

        <div className={`absolute bottom-0 p-4 border-t bg-gray-50 ${collapsed ? "w-16" : "w-64"} flex justify-center`}>
          {!collapsed ? (
            <div className="flex flex-col gap-3 w-full">
              <ApiConfiguration />
              <div className="flex items-center text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 mr-3 flex items-center justify-center text-primary">
                  <span className="material-icons">person</span>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Admin User</p>
                  <p className="text-gray-500 text-xs">admin@socialpulse.ai</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-icons">person</span>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
    </>
  );
}
