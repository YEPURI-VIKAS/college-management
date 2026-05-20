import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, CheckSquare, Wrench, Calendar, Monitor, Search, ShieldAlert } from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadNotifications = () => {
    const saved = localStorage.getItem('pvpsit_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notifications:", e);
      }
    }
  };

  useEffect(() => {
    loadNotifications();
    const handleSync = () => {
      loadNotifications();
    };
    window.addEventListener('pvpsit_notifications_updated', handleSync);
    return () => window.removeEventListener('pvpsit_notifications_updated', handleSync);
  }, []);

  const saveNotifications = (updated: NotificationItem[]) => {
    setNotifications(updated);
    localStorage.setItem('pvpsit_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('pvpsit_notifications_updated'));
  };

  const handleMarkAsRead = (id: number) => {
    const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    saveNotifications(updated);
  };

  const handleNotificationClick = (id: number, title: string) => {
    handleMarkAsRead(id);
    const t = title.toLowerCase();
    if (t.includes('booking') || t.includes('booked') || t.includes('approval') || t.includes('approved') || t.includes('confirmed')) {
      navigate('/bookings', { state: { tab: 'pending' } });
    } else if (t.includes('maintenance') || t.includes('ticket') || t.includes('repaired')) {
      navigate('/maintenance');
    } else if (t.includes('asset') || t.includes('inventory')) {
      navigate('/assets');
    } else if (t.includes('facility') || t.includes('classroom')) {
      navigate('/facilities');
    }
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    saveNotifications(updated);
  };

  const handleDelete = (id: number) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all notification history?")) {
      saveNotifications([]);
    }
  };

  // Determine activity type for icons
  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('maintenance') || t.includes('ticket')) {
      return <Wrench className="text-amber-500" size={18} />;
    }
    if (t.includes('booking') || t.includes('approved')) {
      return <Calendar className="text-blue-500" size={18} />;
    }
    if (t.includes('asset') || t.includes('projector') || t.includes('ac')) {
      return <Monitor className="text-indigo-500" size={18} />;
    }
    if (t.includes('alert') || t.includes('system')) {
      return <ShieldAlert className="text-red-500" size={18} />;
    }
    return <Bell className="text-gray-500" size={18} />;
  };

  const filtered = notifications
    .filter(n => activeTab === 'all' ? true : n.unread)
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications Hub</h1>
          <p className="text-gray-500 mt-1">Review alerts, booking approvals, and system logs.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleMarkAllAsRead}
            disabled={notifications.length === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckSquare size={16} />
            <span>Mark all read</span>
          </button>
          <button 
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-red-100 bg-red-50/50 hover:bg-red-50 rounded-xl text-sm font-medium text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            <span>Clear all</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search & Tabs Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div className="flex space-x-2 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              All Notifications ({notifications.length})
            </button>
            <button 
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'unread' ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Unread ({notifications.filter(n => n.unread).length})
            </button>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
            />
          </div>
        </div>

        {/* Notifications list */}
        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleNotificationClick(item.id, item.title)}
                className={`p-5 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer relative group ${item.unread ? 'bg-blue-50/10' : ''}`}
              >
                {item.unread && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E3A8A]"></span>
                )}
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-100 p-2.5 rounded-xl mt-0.5">
                    {getIcon(item.title)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm ${item.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.title}
                      </h3>
                      {item.unread && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-2xl">{item.desc}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block font-medium">{item.time}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                  title="Delete Notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="inline-flex bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
              <Bell size={32} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">No notifications found</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">
              {searchQuery ? 'No alerts matched your search query.' : 'You have caught up with all notifications.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
