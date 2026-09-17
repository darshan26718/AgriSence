import React, { useState } from 'react';
import {
  User,
  MapPin,
  Sliders,
  Bell,
  Shield,
  CheckCircle2,
  Save,
  LogOut,
} from 'lucide-react';
import { FarmerUser } from '../../types/auth';

interface ModernProfileViewProps {
  onShowToast: (msg: string) => void;
  currentUser?: FarmerUser | null;
  onLogout?: () => void;
}

export const ModernProfileView: React.FC<ModernProfileViewProps> = ({
  onShowToast,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'farm' | 'preferences' | 'notifications' | 'security'>('profile');

  // Form states
  const [farmerName, setFarmerName] = useState(currentUser?.name || 'Ramesh Patil');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98450 88210');
  const [district, setDistrict] = useState(currentUser?.district || 'Dharwad, Karnataka');
  const [holdingSize, setHoldingSize] = useState(`${currentUser?.farmSizeAcres || 4.5} Acres`);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Profile preferences updated successfully.');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Farmer Profile & Settings</h2>
        <p className="text-sm text-slate-500">
          Manage your farmer identity, cadastral farm holding records, alerts, and security credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'farm', label: 'Farm Details', icon: MapPin },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Card Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs max-w-2xl space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-100"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">{farmerName}</h3>
                  <p className="text-xs text-slate-500">Verified Krishi Partner • ID #AG-42918</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={e => setFarmerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">District / Tehsil</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Language</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium">
                    <option>Marathi (मराठी)</option>
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'farm' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <h4 className="text-sm font-bold text-slate-900 font-display">Farm Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Land Holding</label>
                  <input
                    type="text"
                    value={holdingSize}
                    onChange={e => setHoldingSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Primary Soil Type</label>
                  <input
                    type="text"
                    defaultValue="Black Cotton Soil (Clay Loam)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Major Crops Grown</label>
                  <input
                    type="text"
                    defaultValue="Soybean, Cotton, Pigeon Pea (Tur)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Irrigation Source</label>
                  <input
                    type="text"
                    defaultValue="Borewell + Drip Automation"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <h4 className="text-sm font-bold text-slate-900 font-display">Alert Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Critical Pathogen Push Alerts</span>
                    <span className="text-slate-500 text-[11px]">Receive instant banners on high spore risk</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={e => setPushEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700"
                  />
                </label>
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Notification Chimes</span>
                    <span className="text-slate-500 text-[11px]">Play audio alert on critical threshold breaches</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={e => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <h4 className="text-sm font-bold text-slate-900 font-display">Interface Preferences</h4>
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <span className="text-slate-700 font-bold block">Units of Measurement</span>
                <p className="text-slate-500">Acreage in Acres, Dilution in ml/Litre, Temperature in Celsius (°C).</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <h4 className="text-sm font-bold text-slate-900 font-display">Security & Credentials</h4>
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <span className="text-slate-700 font-bold block">Two-Factor SMS Verification</span>
                <p className="text-slate-500">Active for registered mobile number ending in ...4321.</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of AgriSense</span>
              </button>
            ) : <div />}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
