import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import {
    Users, Clock, Globe, Shield, Activity, UserCheck,
    Laptop, MapPin
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const UserActivityPage: React.FC = () => {
    const [loginTrend, setLoginTrend] = useState<any[]>([]);
    const [actionTypeData, setActionTypeData] = useState<any[]>([]);
    const [deviceData, setDeviceData] = useState<any[]>([]);
    const [activityLog, setActivityLog] = useState<any[]>([]);

    useEffect(() => {
        // Future: fetch from API
        setLoginTrend([]);
        setActionTypeData([]);
        setDeviceData([]);
        setActivityLog([]);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">User Activity Monitor</h1>
                    <p className="text-gray-400">Real-time user behavior tracking and session analysis.</p>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="flex items-center justify-between p-4">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Active Sessions</p>
                        <h3 className="text-2xl font-bold text-white font-mono">0</h3>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Users size={20}/></div>
                </GlassCard>
                <GlassCard className="flex items-center justify-between p-4">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Avg Session Time</p>
                        <h3 className="text-2xl font-bold text-white font-mono">0m</h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={20}/></div>
                </GlassCard>
                <GlassCard className="flex items-center justify-between p-4">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Global Locations</p>
                        <h3 className="text-2xl font-bold text-white font-mono">0</h3>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Globe size={20}/></div>
                </GlassCard>
                <GlassCard className="flex items-center justify-between p-4">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Security Alerts</p>
                        <h3 className="text-2xl font-bold text-red-400 font-mono">0</h3>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><Shield size={20}/></div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2">
                    <GlassCard title="User Login Trends (24h)" icon={<Activity size={18} className="text-cyan-400"/>} className="h-[350px]">
                        {loginTrend.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-500">No Login Trend Data</div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={loginTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorAdmins" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#525252" fontSize={10} />
                                <YAxis stroke="#525252" fontSize={10} />
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Standard Users" />
                                <Area type="monotone" dataKey="admins" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAdmins)" name="Administrators" />
                                <Legend />
                            </AreaChart>
                        </ResponsiveContainer>
                        )}
                    </GlassCard>
                </div>

                {/* Device Breakdown */}
                <div>
                    <GlassCard title="Device Distribution" icon={<Laptop size={18} className="text-purple-400"/>} className="h-[350px]">
                        {deviceData.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-500">No Device Data</div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Legend layout="vertical" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                        )}
                        <div className="text-center text-xs text-gray-500 mt-[-20px]">Total Devices: 0</div>
                    </GlassCard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Action Breakdown */}
                 <div>
                    <GlassCard title="Action Types" icon={<UserCheck size={18} className="text-green-400"/>} className="h-[300px]">
                        {actionTypeData.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-500">No Action Data</div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={actionTypeData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} width={80} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {actionTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </GlassCard>
                 </div>

                 {/* Recent Activity Log */}
                 <div className="lg:col-span-2">
                    <GlassCard title="Recent Activity Stream" icon={<Activity size={18} />} className="h-[300px] overflow-hidden flex flex-col">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 text-xs text-gray-500 uppercase font-mono sticky top-0">
                                    <tr>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Action</th>
                                        <th className="p-3">Target Asset</th>
                                        <th className="p-3">Location</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-mono text-gray-300">
                                    {activityLog.length === 0 ? (
                                        <tr><td colSpan={6} className="p-4 text-center text-gray-500">No Recent Activity</td></tr>
                                    ) : activityLog.map((log) => (
                                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-3 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-cyan-900 flex items-center justify-center text-[10px] text-cyan-200 font-bold">
                                                    {log.user.charAt(0).toUpperCase()}
                                                </div>
                                                {log.user}
                                            </td>
                                            <td className="p-3 text-white">{log.action}</td>
                                            <td className="p-3 text-gray-400">{log.target}</td>
                                            <td className="p-3 text-gray-500 flex items-center gap-1"><MapPin size={12}/> US-East</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] border ${
                                                    log.status === 'Success' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    log.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-gray-500">{log.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                 </div>
            </div>
        </div>
    );
};

export default UserActivityPage;
