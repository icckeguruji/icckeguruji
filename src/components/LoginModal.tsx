'use client';

import React, { useState } from 'react';
import { X, User, ShieldCheck, Sparkles, LogIn, Smartphone, Key, CheckCircle2, ArrowRight } from 'lucide-react';
import { User as UserType } from '@/types';
import { getStoredData, saveStoredData } from '@/lib/storage';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Kripya valid 10-digit mobile number enter karein.');
      return;
    }

    if (!otpSent) {
      setOtpSent(true);
      setError('');
      return;
    }

    // Login student
    const data = getStoredData();
    const existingStudent = data.students.find((s) => s.phone.includes(phone) || s.phone === phone);

    const loggedInUser: UserType = existingStudent || {
      id: `student-${Date.now()}`,
      name: name.trim() || `Student ${phone.slice(-4)}`,
      phone: phone.trim(),
      email: `${phone.trim()}@student.local`,
      role: 'student',
      enrolledCourseIds: ['course-1'],
      joinedDate: 'Today',
    };

    saveStoredData('USER', loggedInUser);
    onLoginSuccess(loggedInUser);
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guruji master access
    const adminUser: UserType = {
      id: 'admin-guruji',
      name: 'Guruji (Alok Sharma)',
      phone: '+91 98765 43210',
      email: 'guruji@icckeguruji.com',
      role: 'admin',
      enrolledCourseIds: ['course-1', 'course-2', 'course-3'],
      joinedDate: 'Founder',
    };

    saveStoredData('USER', adminUser);
    onLoginSuccess(adminUser);
    onClose();
  };

  // Quick 1-Click demo logins
  const handleQuickLogin = (role: 'student-rahul' | 'student-priya' | 'admin-guruji') => {
    const data = getStoredData();

    if (role === 'student-rahul') {
      const u = data.students[0] || {
        id: 'student-101',
        name: 'Rahul Kumar',
        phone: '+91 98765 43210',
        email: 'rahul.student@gmail.com',
        role: 'student',
        enrolledCourseIds: ['course-1'],
      };
      saveStoredData('USER', u);
      onLoginSuccess(u);
    } else if (role === 'student-priya') {
      const u = data.students[1] || {
        id: 'student-102',
        name: 'Priya Sharma',
        phone: '+91 98111 22334',
        email: 'priya.sharma99@gmail.com',
        role: 'student',
        enrolledCourseIds: ['course-2'],
      };
      saveStoredData('USER', u);
      onLoginSuccess(u);
    } else {
      const u: UserType = {
        id: 'admin-guruji',
        name: 'Guruji (Alok Sharma)',
        phone: '+91 98765 43210',
        email: 'guruji@icckeguruji.com',
        role: 'admin',
        enrolledCourseIds: ['course-1', 'course-2', 'course-3'],
      };
      saveStoredData('USER', u);
      onLoginSuccess(u);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Login • ICC KE GURUJI</h3>
              <p className="text-xs text-blue-100 font-medium">Access your Live Classes &amp; Notes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-2 bg-slate-100 flex gap-1 border-b border-slate-200">
          <button
            onClick={() => { setActiveTab('student'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Student Login
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Teacher / Guruji Portal
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {activeTab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (WhatsApp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {!otpSent ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 4-Digit OTP *
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 1234 (Demo OTP)"
                    maxLength={4}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-blue-400 rounded-xl text-sm font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Testing ke liye koi bhi 4 digits type karein.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>{otpSent ? 'Verify OTP & Enter Classroom' : 'Send OTP & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900">
                <p className="font-bold">Guruji Master Control Access</p>
                <p className="text-slate-600 mt-1">
                  Yahan se aap courses add kar sakte hain, YouTube live link daal sakte hain aur student UPI approvals verify kar sakte hain.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Master Passcode (or click direct login)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Admin Dashboard</span>
              </button>
            </form>
          )}

          {/* 1-Click Fast Demo Login Shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              ⚡ Quick Testing Shortcuts (1-Click)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('student-rahul')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 text-left transition-colors"
              >
                <div className="text-blue-600 font-extrabold">Rahul Kumar</div>
                <div className="text-[10px] text-slate-500 font-normal">Enrolled in Physics</div>
              </button>
              <button
                onClick={() => handleQuickLogin('admin-guruji')}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold text-purple-900 text-left transition-colors"
              >
                <div className="text-purple-700 font-extrabold">Guruji Admin</div>
                <div className="text-[10px] text-slate-500 font-normal">Full Management</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
