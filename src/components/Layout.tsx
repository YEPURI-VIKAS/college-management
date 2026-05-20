import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DoorOpen, 
  Wrench, 
  Monitor, 
  CalendarClock, 
  LogOut,
  Bell,
  Search,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Facilities', path: '/facilities', icon: DoorOpen },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Assets', path: '/assets', icon: Monitor },
    { name: 'Bookings', path: '/bookings', icon: CalendarClock },
  ];

  return (
    <div className="flex flex-col w-64 bg-[#1E3A8A] text-white h-screen fixed left-0 top-0 shadow-2xl z-20">
      <div className="p-6 flex items-center space-x-3 border-b border-white/10">
        <div className="bg-white p-2 rounded-xl text-[#1E3A8A]">
          <DoorOpen size={24} />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg leading-tight">PVPSIT</h1>
          <p className="text-xs text-blue-200">Facility Manager</p>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-[#1E3A8A] shadow-md font-semibold' 
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('pvpsit_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 1, title: 'New Maintenance Request', desc: 'Projector broken in CSE Lab 1', time: '10 mins ago', unread: true },
      { id: 2, title: 'Booking Approved', desc: 'Main Auditorium booked for Guest Lecture', time: '1 hour ago', unread: true },
      { id: 3, title: 'System Alert', desc: 'Routine maintenance scheduled for this weekend', time: '5 hours ago', unread: false },
    ];
  });

  useEffect(() => {
    const savedStr = localStorage.getItem('pvpsit_notifications');
    const newStr = JSON.stringify(notifications);
    if (savedStr !== newStr) {
      localStorage.setItem('pvpsit_notifications', newStr);
      window.dispatchEvent(new Event('pvpsit_notifications_updated'));
    }
  }, [notifications]);

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('pvpsit_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(prev => {
            if (JSON.stringify(prev) !== saved) {
              return parsed;
            }
            return prev;
          });
        } catch (e) {}
      }
    };
    window.addEventListener('pvpsit_notifications_updated', handleSync);
    return () => window.removeEventListener('pvpsit_notifications_updated', handleSync);
  }, []);

  const [showResults, setShowResults] = useState(false);
  const [dbData, setDbData] = useState<{
    facilities: any[];
    assets: any[];
    tickets: any[];
  }>({ facilities: [], assets: [], tickets: [] });

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
      if (!target.closest('.notification-container')) {
        setShowNotifications(false);
      }
      if (!target.closest('.profile-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchSearchData = async () => {
    try {
      const [facRes, assetRes, ticketRes] = await Promise.all([
        api.get<any[]>('/facilities'),
        api.get<any[]>('/assets'),
        api.get<any[]>('/tickets')
      ]);
      setDbData({
        facilities: facRes || [],
        assets: assetRes || [],
        tickets: ticketRes || []
      });
    } catch (e) {
      console.error('Error fetching global search data:', e);
    }
  };

  const handleResultClick = (path: string) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(path);
  };

  const query = searchQuery.toLowerCase().trim();
  const filteredData = {
    facilities: dbData.facilities.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.id.toLowerCase().includes(query) || 
      f.type.toLowerCase().includes(query)
    ),
    assets: dbData.assets.filter(a => 
      a.name.toLowerCase().includes(query) || 
      a.id.toLowerCase().includes(query) || 
      a.category.toLowerCase().includes(query) ||
      a.location.toLowerCase().includes(query)
    ),
    tickets: dbData.tickets.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.id.toLowerCase().includes(query) || 
      t.location.toLowerCase().includes(query)
    )
  };

  const notificationKey = `pvpsit_notifications_${user?.email || 'guest'}`;

  // Initialize notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(notificationKey);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    } else {
      setNotifications([]);
    }
  }, [notificationKey]);

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem(notificationKey);
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {}
      } else {
        setNotifications([]);
      }
    };
    window.addEventListener('pvpsit_notifications_updated', handleSync);
    return () => window.removeEventListener('pvpsit_notifications_updated', handleSync);
  }, [notificationKey]);

  useEffect(() => {
    const addNotification = (title: string, desc: string) => {
      setNotifications(prev => {
        const newNotifs = [
          { id: Date.now(), title, desc, time: 'Just now', unread: true },
          ...prev
        ];
        localStorage.setItem(notificationKey, JSON.stringify(newNotifs));
        window.dispatchEvent(new Event('pvpsit_notifications_updated'));
        return newNotifs;
      });
      setToast({ title, desc });
      setTimeout(() => {
        setToast(null);
      }, 4000);
    };

    // WebSocket connection to Spring Boot
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.title && payload.desc) {
          addNotification(payload.title, payload.desc);
        }
      } catch (err) {
        console.error("Failed to parse websocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [notificationKey]);

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    localStorage.setItem(`pvpsit_notifications_${user?.email || 'guest'}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('pvpsit_notifications_updated'));
  };

  const handleNotificationClick = (id: number) => {
    const clicked = notifications.find(n => n.id === id);
    const updated = notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    );
    setNotifications(updated);
    localStorage.setItem(`pvpsit_notifications_${user?.email || 'guest'}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('pvpsit_notifications_updated'));
    setShowNotifications(false);
    if (clicked) {
      const t = clicked.title.toLowerCase();
      if (t.includes('booking') || t.includes('booked') || t.includes('approval') || t.includes('approved') || t.includes('confirmed')) {
        navigate('/bookings', { state: { tab: 'pending' } });
      } else if (t.includes('maintenance') || t.includes('ticket') || t.includes('repaired')) {
        navigate('/maintenance');
      } else if (t.includes('asset') || t.includes('inventory') || t.includes('removed') || t.includes('deleted')) {
        navigate('/assets');
      } else if (t.includes('facility') || t.includes('classroom')) {
        navigate('/facilities');
      }
    }
  };

  const handleToastClick = () => {
    if (!toast) return;
    const t = toast.title.toLowerCase();
    setToast(null);
    if (t.includes('booking') || t.includes('booked') || t.includes('approval') || t.includes('approved') || t.includes('confirmed')) {
      navigate('/bookings');
    } else if (t.includes('maintenance') || t.includes('ticket') || t.includes('repaired') || t.includes('status updated')) {
      navigate('/maintenance');
    } else if (t.includes('asset') || t.includes('inventory') || t.includes('removed') || t.includes('deleted')) {
      navigate('/assets');
    } else if (t.includes('facility') || t.includes('classroom')) {
      navigate('/facilities');
    }
  };

  // Extract name from metadata if it exists, otherwise use email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin User';
  const role = user?.user_metadata?.role || 'Faculty / Staff';

  return (
    <>
      {toast && (
        <div 
          onClick={handleToastClick}
          className="fixed top-6 right-6 bg-white text-gray-900 px-5 py-4 rounded-2xl border border-gray-100 hover:border-blue-300 shadow-2xl animate-in slide-in-from-right fade-in duration-300 flex items-start z-50 max-w-sm cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-3.5 mt-1.5 shrink-0 animate-ping"></div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-gray-900">{toast.title}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{toast.desc}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setToast(null);
            }} 
            className="ml-4 text-gray-400 hover:text-gray-600 font-semibold text-sm cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl relative search-container">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E3A8A] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search facilities, assets, or maintenance tickets..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              fetchSearchData();
              setShowResults(true);
            }}
            className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all duration-300 outline-none"
          />
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchQuery.trim() !== '' && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto custom-scrollbar">
            {/* Facilities Results */}
            {filteredData.facilities.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Facilities</div>
                {filteredData.facilities.map(facility => (
                  <div 
                    key={facility.id} 
                    onClick={() => handleResultClick('/facilities')}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-1.5 rounded-lg text-[#1E3A8A]"><DoorOpen size={16} /></div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{facility.name}</p>
                        <p className="text-xs text-gray-500">Room {facility.id} • {facility.type}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{facility.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Assets Results */}
            {filteredData.assets.length > 0 && (
              <div className="p-2 border-t border-gray-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assets</div>
                {filteredData.assets.map(asset => (
                  <div 
                    key={asset.id} 
                    onClick={() => handleResultClick('/assets')}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600"><Monitor size={16} /></div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{asset.name}</p>
                        <p className="text-xs text-gray-500">{asset.id} • {asset.category} • {asset.location}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{asset.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tickets Results */}
            {filteredData.tickets.length > 0 && (
              <div className="p-2 border-t border-gray-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Maintenance Tickets</div>
                {filteredData.tickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    onClick={() => handleResultClick('/maintenance')}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-50 p-1.5 rounded-lg text-amber-600"><Wrench size={16} /></div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{ticket.title}</p>
                        <p className="text-xs text-gray-500">{ticket.id} • {ticket.location} • {ticket.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{ticket.priority}</span>
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{ticket.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredData.facilities.length === 0 && filteredData.assets.length === 0 && filteredData.tickets.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                No matching results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notification Bell with Dropdown */}
        <div className="relative notification-container">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-all ${showNotifications ? 'bg-blue-100 text-[#1E3A8A]' : 'text-gray-500 hover:text-[#1E3A8A] hover:bg-blue-50'}`}
          >
            <Bell size={20} />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#1E3A8A] hover:underline font-medium"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-semibold ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      {notification.unread && <span className="w-2 h-2 bg-[#1E3A8A] rounded-full mt-1.5 shrink-0"></span>}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{notification.desc}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">{notification.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications');
                  }}
                  className="text-sm font-medium text-[#1E3A8A] hover:text-[#1E40AF]"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        <div className="relative profile-container">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 text-gray-700 hover:text-[#1E3A8A] transition-colors"
          >
            <UserCircle size={28} />
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold leading-none">{displayName}</p>
              <p className="text-xs text-gray-500 mt-1">{role}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-2">
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/bookings');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1E3A8A] rounded-lg transition-colors"
                >
                  My Bookings
                </button>
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1E3A8A] rounded-lg transition-colors"
                >
                  Profile Settings
                </button>
                {user?.user_metadata?.role === 'Admin' && (
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/users');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1E3A8A] rounded-lg transition-colors"
                  >
                    User Management
                  </button>
                )}
                <button 
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await signOut();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  </>
  );
};

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
