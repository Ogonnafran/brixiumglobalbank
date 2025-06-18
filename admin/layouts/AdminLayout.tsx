import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from '../../components/common/Icon';
import { ADMIN_NAV_ITEMS, APP_NAME } from '../../constants';
import { LogOut, Menu, X, Bell, UserCog } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { currentUser, isAdmin, logout, getAdminNotifications, markNotificationAsRead, appSettings } = useAppContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);


  if (!currentUser || !isAdmin) {
     navigate('/admin/login');
     return null;
  }
  
  // const adminUser = currentUser as AdminUserType; 
  const adminNotifications = getAdminNotifications();
  const unreadCount = adminNotifications.filter(n => !n.read).length;


  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
     if(!notificationsOpen && unreadCount > 0){
        adminNotifications.filter(n => !n.read).forEach(n => markNotificationAsRead(n.id));
    }
  };


  return (
    <div className="flex h-screen bg-brixium-bg text-brixium-gray-light">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-brixium-bg-light p-4 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-brixium-purple-light cursor-pointer" onClick={() => navigate('/admin/dashboard')}>{APP_NAME} <span className="text-sm text-brixium-gray">(Admin)</span></h1>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-brixium-gray-light hover:text-white">
                <X size={24} />
            </button>
        </div>
        <nav className="flex-grow">
          <ul>
            {ADMIN_NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 my-1 rounded-lg hover:bg-brixium-purple hover:text-white transition-colors duration-200 ${
                      isActive ? 'bg-brixium-purple text-white shadow-lg' : 'text-brixium-gray-light'
                    }`
                  }
                >
                  <Icon name={item.icon} className="mr-3" size={20} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto">
           <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 rounded-lg text-brixium-gray-light hover:bg-red-500 hover:text-white transition-colors duration-200"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-brixium-bg-light shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-brixium-gray-light hover:text-white mr-4">
                <Menu size={24} />
                </button>
                <div className="flex items-center">
                    <UserCog size={28} className="text-brixium-purple-light mr-2" />
                    <div>
                        <span className="text-lg font-semibold text-white">Admin Panel</span>
                         {appSettings.maintenanceMode && <p className="text-xs text-yellow-400">System is in Maintenance Mode</p>}
                    </div>
                </div>
            </div>
          
            <div className="relative">
                <button onClick={toggleNotifications} className="relative text-brixium-gray-light hover:text-brixium-purple-light transition-colors">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-brixium-bg-light bg-red-500" />
                )}
                </button>
                {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-brixium-bg-light border border-brixium-gray-dark rounded-lg shadow-xl z-50 p-2 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center p-2 border-b border-brixium-gray-dark">
                        <h3 className="font-semibold text-white">Admin Notifications</h3>
                        {unreadCount > 0 && <span className="text-xs text-brixium-purple-light">{unreadCount} new</span>}
                    </div>
                    {adminNotifications.length === 0 ? (
                    <p className="text-center text-brixium-gray py-4">No new notifications.</p>
                    ) : (
                    adminNotifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className={`p-2.5 border-b border-brixium-gray-dark/50 hover:bg-brixium-purple/20 cursor-pointer ${!notif.read ? 'bg-brixium-purple/10' : ''}`}
                            onClick={() => {
                                if (!notif.read) markNotificationAsRead(notif.id);
                                if (notif.linkTo) navigate(notif.linkTo);
                                setNotificationsOpen(false);
                            }}
                        >
                        <p className={`text-sm ${!notif.read ? 'font-semibold text-white' : 'text-brixium-gray-light'}`}>{notif.message}</p>
                        <p className="text-xs text-brixium-gray mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                    ))
                    )}
                </div>
                )}
            </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brixium-bg p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;