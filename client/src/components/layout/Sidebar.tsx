import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import ApiConfiguration from "../settings/ApiConfiguration";

type NavLinkProps = {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
};

const NavLink = ({ href, icon, children, active }: NavLinkProps) => {
  return (
    <Link href={href}>
      <a
        className={`flex items-center px-4 py-3 text-sm rounded-md mx-2 my-1 transition-colors ${
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <span className="material-icons text-lg mr-3">{icon}</span>
        {children}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
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
        className={`w-64 bg-white border-r shadow-sm h-full ${
          mobileOpen
            ? "fixed z-20 top-16 left-0 h-screen w-64"
            : "hidden"
        } md:block flex-shrink-0`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold flex items-center text-gray-800">
            <span className="material-icons text-primary mr-2">insights</span>
            SocialPulse AI
          </h1>
        </div>

        <div className="overflow-y-auto h-[calc(100%-180px)] py-4">
          <nav>
            <div className="px-4 py-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              Main Menu
            </div>
            <NavLink href="/" icon="dashboard" active={location === "/"}>
              Dashboard
            </NavLink>
            <NavLink href="/history" icon="history" active={location === "/history"}>
              History
            </NavLink>
            <NavLink href="/profiles" icon="person" active={location === "/profiles"}>
              Profiles
            </NavLink>
            <NavLink href="/settings" icon="settings" active={location === "/settings"}>
              Settings
            </NavLink>

            <div className="px-4 py-2 mt-6 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              Analytics
            </div>
            <NavLink href="/trends" icon="trending_up" active={location === "/trends"}>
              Trends
            </NavLink>
            <NavLink
              href="/influencers"
              icon="group"
              active={location === "/influencers"}
            >
              Influencers
            </NavLink>
            <NavLink href="/reports" icon="bar_chart" active={location === "/reports"}>
              Reports
            </NavLink>
            
            <div className="px-4 py-2 mt-6 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              Tools
            </div>
            <NavLink href="/export" icon="download" active={location === "/export"}>
              Export Tools
            </NavLink>
            <NavLink href="/alerts" icon="notifications" active={location === "/alerts"}>
              Alerts
            </NavLink>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-gray-50">
          <div className="flex flex-col gap-3">
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
