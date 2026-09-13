import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  LayoutDashboard, 
  Files, 
  UploadCloud, 
  MessageSquare, 
  LogOut, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import UploadCenter from './pages/UploadCenter';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';

function Sidebar({ 
  collapsed, 
  setCollapsed, 
  isMobile = false, 
  onCloseMobile 
}: { 
  collapsed: boolean; 
  setCollapsed: (val: boolean) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}) {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: Files },
    { name: 'Chat (RAG)', path: '/chat', icon: MessageSquare },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
  ];

  return (
    <aside 
      className={`h-full flex flex-col bg-slate-900 border-r border-slate-800 select-none ${
        isMobile ? 'w-[260px] shadow-2xl' : `fixed inset-y-0 left-0 z-30 hidden lg:flex transition-all duration-200 ${collapsed ? 'w-[68px]' : 'w-[230px]'}`
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 flex items-center border-b border-slate-800/80 shrink-0 relative ${
        collapsed && !isMobile ? 'justify-center px-0' : 'px-4 justify-between'
      }`}>
        <div className={`flex items-center gap-2.5 ${collapsed && !isMobile ? 'justify-center' : 'overflow-hidden'}`}>
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-white font-bold text-sm tracking-tight truncate leading-tight">
                DocuMind AI
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Document Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Desktop Sidebar Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors hidden lg:flex items-center justify-center border border-slate-700 shadow-xs z-30 ${
              collapsed 
                ? 'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6' 
                : 'w-7 h-7'
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Workspace Indicator */}
      {(!collapsed || isMobile) && (
        <div className="px-3 pt-3 pb-1">
          <div className="px-2.5 py-1.5 rounded-md bg-slate-800/50 border border-slate-700/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-medium truncate">
              {user?.workspaces?.[0]?.name || 'Default Workspace'}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (isMobile && onCloseMobile) {
                onCloseMobile();
              }
            }}
            className={({ isActive }) =>
              `flex items-center h-9 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              } ${collapsed && !isMobile ? 'justify-center px-0' : 'gap-3'}`
            }
            title={collapsed && !isMobile ? item.name : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {(!collapsed || isMobile) && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Logout Block */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <div className={`flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-800/60 ${collapsed && !isMobile ? 'justify-center p-1.5' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-medium text-slate-200 truncate leading-tight">
                {user?.display_name || user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email || 'Admin'}
              </div>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <button
              onClick={logout}
              className="p-1 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function TopBar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const location = useLocation();
  const pathTitle = location.pathname.substring(1).replace('-', ' ') || 'Dashboard';
  const displayTitle = pathTitle === 'chat' ? 'Chat (RAG)' : pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);

  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobileMenu} 
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-50"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Breadcrumb (Eliminates the duplicate header bug) */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>DocuMind</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{displayTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Telemetry Badges */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Qdrant & Groq
          </span>
          <span className="text-slate-300">|</span>
          <span>Online</span>
        </div>
      </div>
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:hidden transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          collapsed={false} 
          setCollapsed={() => {}} 
          isMobile={true} 
          onCloseMobile={() => setMobileOpen(false)} 
        />
      </div>

      {/* Main Fluid Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${collapsed ? 'lg:pl-[68px]' : 'lg:pl-[230px]'}`}>
        <TopBar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Layout><Documents /></Layout></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Layout><UploadCenter /></Layout></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
