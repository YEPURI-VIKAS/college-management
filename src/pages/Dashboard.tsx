import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DoorOpen, Wrench, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, Monitor } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportGenerated(false);
    
    setTimeout(() => {
      // Generate CSV content
      const headers = ['Metric', 'Value', 'Change'];
      const statsRows = stats.map(s => `"${s.title}","${s.value}","${s.change}"`).join('\n');
      
      const activityHeaders = ['ID', 'Activity', 'Time', 'Type'];
      const activityRows = recentActivities.map(a => `"${a.id}","${a.text}","${a.time}","${a.type}"`).join('\n');
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(',') + '\n' + statsRows + '\n\n'
        + activityHeaders.join(',') + '\n' + activityRows;
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `facility_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsGenerating(false);
      setReportGenerated(true);
      // Hide success message after 3 seconds
      setTimeout(() => setReportGenerated(false), 3000);
    }, 1000);
  };

  const [stats, setStats] = useState([
    { title: 'Available Classrooms', value: '42', change: '+12%', trend: 'up', icon: DoorOpen, color: 'bg-blue-500' },
    { title: 'Active Maintenance', value: '18', change: '-5%', trend: 'down', icon: Wrench, color: 'bg-amber-500' },
    { title: 'Total Assets', value: '1,240', change: '+2%', trend: 'up', icon: Users, color: 'bg-green-500' },
    { title: 'Critical Issues', value: '3', change: '0%', trend: 'neutral', icon: AlertTriangle, color: 'bg-red-500' },
  ]);

  const [activityData, setActivityData] = useState([
    { name: 'Mon', usage: 4000 },
    { name: 'Tue', usage: 3000 },
    { name: 'Wed', usage: 2000 },
    { name: 'Thu', usage: 2780 },
    { name: 'Fri', usage: 1890 },
    { name: 'Sat', usage: 2390 },
    { name: 'Sun', usage: 3490 },
  ]);

  const [recentActivities, setRecentActivities] = useState<any[]>([
    { id: 1, text: 'Projector fixed in Room 204', time: '10 mins ago', type: 'maintenance' },
    { id: 2, text: 'Seminar Hall booked for Guest Lecture', time: '1 hour ago', type: 'booking' },
    { id: 3, text: 'New AC unit installed in CSE Lab 1', time: '3 hours ago', type: 'asset' },
    { id: 4, text: 'Routine inspection completed in Main Block', time: '5 hours ago', type: 'maintenance' },
  ]);

  const [selectedWeek, setSelectedWeek] = useState<'This Week' | 'Last Week'>('This Week');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [facilities, tickets, assets, bookings] = await Promise.all([
          api.get<any[]>('/facilities'),
          api.get<any[]>('/tickets'),
          api.get<any[]>('/assets'),
          api.get<any[]>('/bookings')
        ]);

        const availableClassrooms = facilities.filter(f => f.type === 'Classroom' && f.status === 'Available').length;
        const activeMaintenance = tickets.filter(t => t.status !== 'Completed' && t.status !== 'Resolved').length;
        const totalAssets = assets.length;
        const criticalIssues = tickets.filter(t => t.priority === 'High' && t.status !== 'Completed' && t.status !== 'Resolved').length;

        setStats([
          { 
            title: 'Available Classrooms', 
            value: availableClassrooms.toString(), 
            change: availableClassrooms > 0 ? '+12%' : '0%', 
            trend: availableClassrooms > 0 ? 'up' : 'neutral', 
            icon: DoorOpen, 
            color: 'bg-blue-500' 
          },
          { 
            title: 'Active Maintenance', 
            value: activeMaintenance.toString(), 
            change: '-5%', 
            trend: 'down', 
            icon: Wrench, 
            color: 'bg-amber-500' 
          },
          { 
            title: 'Total Assets', 
            value: totalAssets.toString(), 
            change: '+2%', 
            trend: 'up', 
            icon: Users, 
            color: 'bg-green-500' 
          },
          { 
            title: 'Critical Issues', 
            value: criticalIssues.toString(), 
            change: '0%', 
            trend: 'neutral', 
            icon: AlertTriangle, 
            color: 'bg-red-500' 
          },
        ]);

        // Weekly usage calculation
        const baseUsageThisWeek: Record<number, number> = {
          1: 3000, // Mon
          2: 2400, // Tue
          3: 2000, // Wed
          4: 2600, // Thu
          5: 1800, // Fri
          6: 800,  // Sat
          0: 400,  // Sun
        };

        const baseUsageLastWeek: Record<number, number> = {
          1: 2800, // Mon
          2: 2200, // Tue
          3: 2100, // Wed
          4: 2400, // Thu
          5: 1900, // Fri
          6: 600,  // Sat
          0: 300,  // Sun
        };

        const currentBaseline = selectedWeek === 'This Week' ? baseUsageThisWeek : baseUsageLastWeek;

        // Calculate start and end date for the selected week
        const todayDate = new Date();
        const startOfCurrentWeek = new Date(todayDate);
        const day = startOfCurrentWeek.getDay();
        const diff = startOfCurrentWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfCurrentWeek.setDate(diff);
        startOfCurrentWeek.setHours(0, 0, 0, 0);

        if (selectedWeek === 'Last Week') {
          startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - 7);
        }

        const startMs = startOfCurrentWeek.getTime();
        const endMs = startMs + 7 * 24 * 60 * 60 * 1000;

        // Sum booking minutes per day of the week
        const dailyBookingMinutes: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };

        bookings.forEach(booking => {
          if (!booking.time) return;
          const match = booking.time.match(/^(\d{4}-\d{2}-\d{2})/);
          if (match) {
            const bookingDateStr = match[1];
            const bookingDate = new Date(bookingDateStr);
            const bookingMs = bookingDate.getTime();
            if (bookingMs >= startMs && bookingMs < endMs) {
              const dayOfWeek = bookingDate.getDay(); // 0-6
              
              // Calculate duration
              let duration = 60; // 1 hour default
              const rangeMatch = booking.time.match(/(\d{2}):(\d{2})\s*([AP]M)\s*-\s*(\d{2}):(\d{2})\s*([AP]M)/i);
              if (rangeMatch) {
                let sh = parseInt(rangeMatch[1]);
                const sm = parseInt(rangeMatch[2]);
                const sampm = rangeMatch[3].toUpperCase();
                let eh = parseInt(rangeMatch[4]);
                const em = parseInt(rangeMatch[5]);
                const eampm = rangeMatch[6].toUpperCase();
                
                if (sampm === 'PM' && sh < 12) sh += 12;
                if (sampm === 'AM' && sh === 12) sh = 0;
                if (eampm === 'PM' && eh < 12) eh += 12;
                if (eampm === 'AM' && eh === 12) eh = 0;
                
                const startMin = sh * 60 + sm;
                const endMin = eh * 60 + em;
                duration = Math.max(30, endMin - startMin);
              }
              dailyBookingMinutes[dayOfWeek] = (dailyBookingMinutes[dayOfWeek] || 0) + duration;
            }
          }
        });

        const newChartData = [
          { name: 'Mon', usage: currentBaseline[1] + (dailyBookingMinutes[1] || 0) },
          { name: 'Tue', usage: currentBaseline[2] + (dailyBookingMinutes[2] || 0) },
          { name: 'Wed', usage: currentBaseline[3] + (dailyBookingMinutes[3] || 0) },
          { name: 'Thu', usage: currentBaseline[4] + (dailyBookingMinutes[4] || 0) },
          { name: 'Fri', usage: currentBaseline[5] + (dailyBookingMinutes[5] || 0) },
          { name: 'Sat', usage: currentBaseline[6] + (dailyBookingMinutes[6] || 0) },
          { name: 'Sun', usage: currentBaseline[0] + (dailyBookingMinutes[0] || 0) },
        ];

        setActivityData(newChartData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    const loadNotifications = () => {
      const saved = localStorage.getItem('pvpsit_notifications');
      let activities = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          activities = parsed.map((item: any) => {
            let type = 'system';
            const title = item.title.toLowerCase();
            if (title.includes('maintenance') || title.includes('ticket')) {
              type = 'maintenance';
            } else if (title.includes('booking') || title.includes('approved') || title.includes('confirmed')) {
              type = 'booking';
            } else if (title.includes('asset') || title.includes('projector') || title.includes('ac')) {
              type = 'asset';
            }
            return {
              id: item.id,
              text: `${item.title}: ${item.desc}`,
              time: item.time,
              type: type
            };
          });
        } catch (e) {
          console.error(e);
        }
      }
      
      if (activities.length === 0) {
        activities = [
          { id: 1, text: 'Projector fixed in Room 204', time: '10 mins ago', type: 'maintenance' },
          { id: 2, text: 'Seminar Hall booked for Guest Lecture', time: '1 hour ago', type: 'booking' },
          { id: 3, text: 'New AC unit installed in CSE Lab 1', time: '3 hours ago', type: 'asset' },
          { id: 4, text: 'Routine inspection completed in Main Block', time: '5 hours ago', type: 'maintenance' },
        ];
      }
      setRecentActivities(activities.slice(0, 4));
    };

    fetchDashboardStats();
    loadNotifications();

    const handleSync = () => {
      loadNotifications();
    };
    window.addEventListener('pvpsit_notifications_updated', handleSync);
    return () => window.removeEventListener('pvpsit_notifications_updated', handleSync);
  }, [selectedWeek]);

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {reportGenerated && (
        <div className="absolute top-0 right-0 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 shadow-lg animate-in slide-in-from-top-4 fade-in duration-300 flex items-center z-50">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
          <span className="font-medium text-sm">Monthly Report generated successfully!</span>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here's what's happening on campus today.</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="bg-[#1E3A8A] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center min-w-[150px] justify-center"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Generating...
            </>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover-lift">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-md`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`flex items-center font-medium ${
                stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : stat.trend === 'down' ? <ArrowDownRight size={16} className="mr-1" /> : null}
                {stat.change}
              </span>
              <span className="text-gray-400 ml-2">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Facility Usage (Weekly)</h2>
            <select 
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value as 'This Week' | 'Last Week')}
              className="bg-gray-50 border-none text-sm font-medium rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 text-gray-600"
            >
              <option value="This Week">This Week</option>
              <option value="Last Week">Last Week</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="usage" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="bg-blue-50 p-2 rounded-full mr-4 text-[#1E3A8A]">
                  {activity.type === 'maintenance' && <Wrench size={16} />}
                  {activity.type === 'booking' && <Clock size={16} />}
                  {activity.type === 'asset' && <Monitor size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{activity.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
