'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminApi, AdminProfileData } from '@/lib/api';
import {
  User,
  LogOut,
  Upload,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  X,
  Camera,
} from 'lucide-react';

interface AdminHeaderProps {
  titleHi?: string;
  titleEn: string;
  subtitleHi?: string;
  subtitleEn?: string;
}

export function AdminHeader({ titleEn, subtitleEn }: AdminHeaderProps) {
  const router = useRouter();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfileData>({
    id: 'adm00000-0000-0000-0000-000000000001',
    full_name: 'BADE SIR (Director)',
    email: 'icckeguruji@gmail.com',
    mobile_number: '9771350910',
    role: 'admin',
    avatar_url: '/logo.png',
  });

  const [formData, setFormData] = useState({
    full_name: 'BADE SIR (Director)',
    email: 'icckeguruji@gmail.com',
    mobile_number: '9771350910',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AdminApi.getAdminProfile().then((data) => {
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        email: data.email,
        mobile_number: data.mobile_number,
      });
    });
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const photoUrl = event.target.result as string;
          setProfile((prev) => ({ ...prev, avatar_url: photoUrl }));
          AdminApi.updateAdminProfile({ avatar_url: photoUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);

    try {
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setStatusMsg({ type: 'error', text: 'Passwords do not match.' });
          setLoading(false);
          return;
        }
        const pwRes = await AdminApi.changeAdminPassword(newPassword);
        if (!pwRes.success) {
          setStatusMsg({ type: 'error', text: pwRes.message });
          setLoading(false);
          return;
        }
      }

      const updated = await AdminApi.updateAdminProfile({
        full_name: formData.full_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
      });

      setProfile(updated);
      setStatusMsg({ type: 'success', text: 'Profile & details updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsProfileModalOpen(false);
        setStatusMsg(null);
      }, 1500);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AdminApi.logout();
    router.replace('/login');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 md:top-0 z-20">
        <div className="min-w-0 pr-2">
          <h2 className="text-base sm:text-xl font-bold text-slate-800 truncate">{titleEn}</h2>
          {subtitleEn && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitleEn}</p>}
        </div>

        <div className="flex items-center space-x-4">
          {/* Zero Paid Policy Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>₹0/mo Plan (Active)</span>
          </div>

          {/* Interactive Super Admin Profile Trigger */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-2 pl-2 border-l border-slate-200 hover:bg-slate-50 p-1.5 rounded-xl transition text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center text-blue-700 font-bold text-xs relative flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                'DIR'
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none group-hover:text-blue-600 transition">
                {profile.full_name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">+91 {profile.mobile_number}</p>
            </div>
          </button>
        </div>
      </header>

      {/* Admin Profile & Password Management Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Director / Admin Profile Management
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setStatusMsg(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Profile Avatar Upload with Device Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-blue-500 overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-md">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Director Profile"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <h4 className="font-bold text-slate-900 text-sm">{profile.full_name}</h4>
                <p className="text-xs text-slate-500">{profile.email} • Super Administrator</p>
                <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-sm transition">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload Photo from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Director Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Change Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Change Admin Password (Optional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold flex items-center space-x-1.5 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout from Admin</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setStatusMsg(null);
                    }}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm"
                  >
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
