import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/assets/logo.jpg"
            alt="YCCify"
            className="w-11 h-11 rounded-xl shadow-md group-hover:scale-105 transition-transform object-cover"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-brand-blue transition-colors">
              YCC<span className="text-brand-blue">ify</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider -mt-1">
              YCCE Nagpur
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-semibold text-slate-700 hover:text-brand-blue transition-colors"
          >
            Home
          </Link>
          <a
            href="#features"
            className="text-sm font-semibold text-slate-700 hover:text-brand-blue transition-colors"
          >
            Features
          </a>
          <Link
            to="/faculty"
            className="text-sm font-semibold text-slate-700 hover:text-brand-blue transition-colors"
          >
            Faculty
          </Link>
          <a
            href="#about"
            className="text-sm font-semibold text-slate-700 hover:text-brand-blue transition-colors"
          >
            About
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-hover shadow-md shadow-brand-blue/20 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Go to {user.role === 'admin' ? 'Admin Portal' : 'Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-brand-blue hover:bg-slate-100 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-hover shadow-md shadow-brand-blue/25 hover:shadow-brand-blue/40 transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

