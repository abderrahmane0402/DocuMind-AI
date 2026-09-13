import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  LayoutDashboard, 
  Files, 
  UploadCloud, 
  MessageSquare, 
  CheckSquare, 
  BarChart3, 
  FolderKanban, 
  Users, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import UploadCenter from './pages/UploadCenter';
import Chat from './pages/Chat';
import Validation from './pages/Validation';
import Analytics from './pages/Analytics';
import ProtectedRoute from './components/ProtectedRoute';

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (val: boolean) => void }) {
  const { logout, user } = useAuth();

  // Navigation order explicitly defined in Section 6:
  // 1. Dashboard, 2. Documents, 3. Upload, 4. Chat (RAG), 5. Validation, 6. Analytics, 7. Workspaces, 8. Users, 9. Audit logs, 10. Settings
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: Files },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Chat (RAG)', path: '/chat', icon: MessageSquare },
    { name: 'Validation', path: '/validation', icon: CheckSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Workspaces', path: '/workspaces', icon: FolderKanban },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      style={{ backgroundColor: '#0B102D' }}
      className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-200 border-r border-[#151C46] ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#151C46]/60 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-base tracking-tight truncate">
              DocuMind AI
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151C46] transition-colors hidden lg:block"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center h-10 px-3 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#151C46]'
              } ${collapsed ? 'justify-center px-0' : 'gap-3'}`
            }
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Logout Block */}
      <div className="p-3 border-t border-[#151C46]/60 shrink-0">
        <div className={`flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#151C46]/50 transition-colors ${collapsed ? 'justify-center p-1' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[#151C46] border border-[#4F46E5]/40 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-medium text-white truncate leading-tight">
                {user?.display_name || user?.email || 'Sarah Johnson'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">Admin</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1 text-slate-400 hover:text-red-400 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
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
  const displayTitle = pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobileMenu} 
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-50"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-lg font-bold text-[#111827] capitalize tracking-tight">
          {displayTitle}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search - 320px width on desktop as specified in Section 6 */}
        <div className="relative hidden md:block w-[320px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full h-9 pl-9 pr-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF]"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex text-[#111827]">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#070B22]/55 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:hidden transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar collapsed={false} setCollapsed={() => setMobileOpen(false)} />
      </div>

      {/* Main Fluid Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'}`}>
        <TopBar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 shadow-xs max-w-4xl">
      <h2 className="text-xl font-bold text-[#111827]">{title}</h2>
      <p className="text-sm text-[#6B7280] mt-1">{description}</p>
      <div className="mt-8 p-6 rounded-lg border border-dashed border-[#D1D5DB] text-center text-sm text-[#9CA3AF]">
        Feature active and configured in enterprise suite.
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
          <Route path="/validation" element={<ProtectedRoute><Layout><Validation /></Layout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
          <Route path="/workspaces" element={<ProtectedRoute><Layout><PlaceholderPage title="Workspaces Management" description="Multi-tenant workspace isolation and role permissions." /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Layout><PlaceholderPage title="User Administration" description="Manage enterprise members, roles, and API access." /></Layout></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute><Layout><PlaceholderPage title="Audit & Compliance Logs" description="Immutable activity tracking for SOC2 and GDPR compliance." /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><PlaceholderPage title="System Settings" description="Configure OCR engines, Qdrant vectors, and LLM providers." /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
