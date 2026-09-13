import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers, ArrowRight, Lock, Mail, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      login(data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* 58% Left Decorative Brand Panel on Desktop (Section 9.1) */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0B102D 0%, #171A55 100%)'
        }}
        className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-12 text-white overflow-hidden"
      >
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818CF8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Brand Logo Row */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">DocuMind AI</span>
        </div>

        {/* Hero Copy */}
        <div className="max-w-xl z-10 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#4F46E5]/20 text-[#A5B4FC] border border-[#4F46E5]/30">
            Enterprise Document Intelligence
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            AI-powered document intelligence with human validation.
          </h1>
          <p className="text-[#CBD5E1] text-base leading-relaxed">
            Extract, validate, and chat with mission-critical contracts, invoices, and structured documents at enterprise scale.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4 text-xs text-[#CBD5E1]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>SOC2 compliant vector search</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Real-time OCR extraction</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-[#9CA3AF] z-10">
          © {new Date().getFullYear()} DocuMind AI Inc. All rights reserved.
        </div>
      </div>

      {/* 42% Right Form Panel */}
      <div className="w-full lg:w-[42%] flex items-center justify-center p-6 md:p-12 bg-[#F6F8FC]">
        <div className="w-full max-w-[420px] bg-white rounded-xl p-8 border border-[#E5E7EB] shadow-xs">
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-[#111827]">DocuMind AI</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Welcome back</h2>
            <p className="text-xs text-[#6B7280] mt-1">Sign in to your document workspace</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full h-10 pl-9 pr-3 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#111827]">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-[#4F46E5] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="w-full h-10 pl-9 pr-10 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#EEF2FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-10 mt-2 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#4F46E5] hover:underline">
              Sign up
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
