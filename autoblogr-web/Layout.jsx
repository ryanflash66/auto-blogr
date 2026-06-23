import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  Settings,
  User as UserIcon,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    description: "Overview & analytics",
  },
  {
    title: "Ideas",
    url: createPageUrl("Ideas"),
    icon: Lightbulb,
    description: "Create & manage ideas",
  },
  {
    title: "Posts",
    url: createPageUrl("Posts"),
    icon: FileText,
    description: "Generated content",
  },
  {
    title: "WordPress",
    url: createPageUrl("WordPress"),
    icon: Settings,
    description: "Site connections",
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: UserIcon,
    description: "Business settings",
  },
  {
    title: "AI Status",
    url: "/ai-service-status",
    icon: Settings,
    description: "AI service monitoring",
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();

  const isActivePage = (url) => location.pathname === url;

  // Don't show navigation for sign-in/sign-up pages
  if (
    !isSignedIn &&
    (location.pathname === "/sign-in" || location.pathname === "/sign-up")
  ) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <style>
        {`
          :root {
            --primary: #059669;
            --primary-dark: #047857;
            --accent: #f59e0b;
            --accent-dark: #d97706;
            --dark: #1a1a1a;
            --dark-light: #2d2d2d;
            --text-light: #6b7280;
            --border-light: #e5e7eb;
          }
          
          .glass-effect {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .nav-item-active {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            transform: translateX(4px);
          }
          
          .nav-item-inactive {
            color: var(--text-light);
            transition: all 0.3s ease;
          }
          
          .nav-item-inactive:hover {
            color: var(--primary);
            background: rgba(5, 150, 105, 0.05);
            transform: translateX(2px);
          }
          
          .premium-gradient {
            background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          }
          
          .text-gradient {
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto glass-effect px-6 py-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="premium-gradient w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">AutoBlogr</h1>
              <p className="text-xs text-gray-500 font-medium">
                AI Content Creation
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col space-y-2">
            {navigationItems.map((item) => {
              const isActive = isActivePage(item.url);
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive ? "nav-item-active shadow-lg" : "nav-item-inactive"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className={isActive ? "text-white" : ""}>
                      {item.title}
                    </span>
                    <span
                      className={`text-xs ${
                        isActive ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="space-y-4">
            {/* User Profile Section */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 p-4">
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10",
                    },
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || user?.firstName || "User"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.primaryEmailAddress?.emailAddress ||
                      "user@autoblogr.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* AI-Powered Badge */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50 p-4">
              <div className="text-center">
                <Zap className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                <h3 className="text-sm font-semibold text-gray-900">
                  AI-Powered
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Create amazing content with the power of AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="glass-effect px-4 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="premium-gradient w-8 h-8 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gradient">AutoBlogr</h1>
          </div>
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                },
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-effect border-b border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = isActivePage(item.url);
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
