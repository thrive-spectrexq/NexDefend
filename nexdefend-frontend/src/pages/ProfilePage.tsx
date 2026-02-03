import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import {
    User, Lock, Activity,
    Smartphone, Monitor, Globe, Clock,
    Save, Key, CheckCircle, AlertCircle
} from 'lucide-react';
import client from '../api/client';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'activity'>('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  // Form States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/profile');
      setProfile(res.data);
      setUsername(res.data.username);
      setEmail(res.data.email);
    } catch (err) {
      console.error("Failed to load profile", err);
      // Fallback for demo
      setUsingDemo(true);
      const demoProfile = {
          id: 1,
          username: "Demo User",
          email: "demo@nexdefend.ai",
          role: "admin",
          created_at: new Date().toISOString()
      };
      setProfile(demoProfile);
      setUsername(demoProfile.username);
      setEmail(demoProfile.email);
    }
  };

  const handleUpdateInfo = async () => {
    setLoading(true);
    try {
      if (!usingDemo) {
          await client.put('/auth/profile', { username, email });
      } else {
          await new Promise(r => setTimeout(r, 1000));
      }
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      if (!usingDemo) {
          await client.put('/auth/profile', {
              old_password: oldPassword,
              password: newPassword
          });
      } else {
           await new Promise(r => setTimeout(r, 1000));
      }
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        if (error.response?.status === 401) {
            setMessage({ type: 'error', text: 'Incorrect old password' });
        } else {
            setMessage({ type: 'error', text: 'Failed to update password' });
        }
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-10 text-center text-cyan-400 font-mono animate-pulse">Initializing User Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* Messages */}
      {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
              <button onClick={() => setMessage(null)} className="ml-auto hover:text-white">✕</button>
          </div>
      )}

      {usingDemo && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 p-3 rounded-lg text-xs font-mono text-center">
              DEMO MODE: Backend unavailable. Changes will not persist.
          </div>
      )}

      {/* Profile Header */}
      <GlassCard className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-white/20">
            {profile.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
            <p className="text-gray-400 font-mono">{profile.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    profile.role === 'admin' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                }`}>
                    {profile.role}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-500/30 text-green-400 bg-green-500/10">
                    Active
                </span>
            </div>
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
            <div className="text-xs text-gray-500 uppercase tracking-wider text-right">Security Score</div>
            <div className="text-2xl font-mono text-green-400 font-bold text-right">92/100</div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
          {[
              { id: 'personal', label: 'Personal Info', icon: <User size={16} /> },
              { id: 'security', label: 'Security & Login', icon: <Lock size={16} /> },
              { id: 'activity', label: 'Activity Log', icon: <Activity size={16} /> },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-mono font-bold uppercase transition-all border-b-2 ${
                      activeTab === tab.id
                      ? 'text-cyan-400 border-cyan-400 bg-white/5'
                      : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                  }`}
              >
                  {tab.icon} {tab.label}
              </button>
          ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
          {activeTab === 'personal' && (
              <GlassCard title="Edit Profile Details">
                  <div className="space-y-6 max-w-lg">
                      <div>
                          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Username</label>
                          <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full bg-[#050505] border border-white/10 text-white p-3 rounded focus:border-cyan-500 outline-none transition-colors"
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                          <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-[#050505] border border-white/10 text-white p-3 rounded focus:border-cyan-500 outline-none transition-colors"
                          />
                      </div>
                      <div className="pt-4">
                          <NeonButton variant="primary" glow onClick={handleUpdateInfo} disabled={loading}>
                              <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                          </NeonButton>
                      </div>
                  </div>
              </GlassCard>
          )}

          {activeTab === 'security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard title="Change Password" icon={<Key size={18} />}>
                      <div className="space-y-4">
                          <input
                              type="password" placeholder="Current Password"
                              value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                              className="w-full bg-[#050505] border border-white/10 text-white p-3 rounded focus:border-cyan-500 outline-none transition-colors"
                          />
                          <input
                              type="password" placeholder="New Password"
                              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-[#050505] border border-white/10 text-white p-3 rounded focus:border-cyan-500 outline-none transition-colors"
                          />
                          <input
                              type="password" placeholder="Confirm New Password"
                              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-[#050505] border border-white/10 text-white p-3 rounded focus:border-cyan-500 outline-none transition-colors"
                          />
                          <NeonButton variant="primary" onClick={handleUpdatePassword} disabled={loading || !oldPassword}>
                              Update Password
                          </NeonButton>
                      </div>
                  </GlassCard>

                  <div className="space-y-6">
                      <GlassCard title="Two-Factor Authentication" icon={<Smartphone size={18} />}>
                          <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-400">Secure your account with 2FA.</div>
                              <NeonButton variant="primary" className="text-xs">Enable</NeonButton>
                          </div>
                      </GlassCard>

                      <GlassCard title="Active Sessions" icon={<Monitor size={18} />}>
                          <div className="space-y-3">
                              <div className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/5">
                                  <Globe className="text-green-400" size={20} />
                                  <div>
                                      <div className="text-sm text-white font-bold">San Francisco, US</div>
                                      <div className="text-xs text-gray-500">Chrome on MacOS • Current Session</div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-3 p-2 rounded border border-transparent opacity-50">
                                  <Globe className="text-gray-400" size={20} />
                                  <div>
                                      <div className="text-sm text-white font-bold">New York, US</div>
                                      <div className="text-xs text-gray-500">Firefox on Windows • 2h ago</div>
                                  </div>
                              </div>
                          </div>
                      </GlassCard>
                  </div>
              </div>
          )}

          {activeTab === 'activity' && (
              <GlassCard title="Recent Activity Log">
                  <div className="relative border-l border-white/10 ml-3 space-y-6 pl-6 py-2">
                      {[
                          { action: 'Password Changed', time: 'Just now', device: '192.168.1.5' },
                          { action: 'Updated Settings', time: '2 hours ago', device: '192.168.1.5' },
                          { action: 'Login Successful', time: '5 hours ago', device: '192.168.1.5' },
                          { action: 'Viewed Incident #4021', time: 'Yesterday', device: '10.0.0.42' },
                      ].map((log, i) => (
                          <div key={i} className="relative">
                              <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                              <div className="text-white font-bold">{log.action}</div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 font-mono">
                                  <span className="flex items-center gap-1"><Clock size={12}/> {log.time}</span>
                                  <span className="flex items-center gap-1"><Monitor size={12}/> {log.device}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </GlassCard>
          )}
      </div>
    </div>
  );
};

export default ProfilePage;
