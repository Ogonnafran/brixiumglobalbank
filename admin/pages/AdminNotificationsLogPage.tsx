
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AppNotification } from '../../types';
import Icon from '../../components/common/Icon';
import { BellRing, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminNotificationsLogPage: React.FC = () => {
    const { getAdminNotifications, markNotificationAsRead } = useAppContext();
    const navigate = useNavigate();
    const notifications = getAdminNotifications();

    const getIconForType = (type: AppNotification['type']) => {
        switch(type) {
            case 'New KYC Submission': return <Icon name={Info} className="text-blue-400" size={20}/>;
            case 'New Withdrawal Request': return <Icon name={BellRing} className="text-yellow-400" size={20}/>;
            default: return <Icon name={Info} className="text-brixium-gray" size={20}/>;
        }
    }
    
    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.read) {
            markNotificationAsRead(notification.id);
        }
        if (notification.linkTo) {
            navigate(notification.linkTo);
        }
    };


    return (
        <div className="bg-brixium-bg-light p-6 rounded-xl shadow-xl animate-slide-in-up">
            <h2 className="text-2xl font-semibold text-brixium-purple-light mb-6">Admin Notifications Log</h2>
            {notifications.length === 0 ? (
                <p className="text-center text-brixium-gray py-8">No notifications recorded.</p>
            ) : (
                <ul className="divide-y divide-brixium-gray-dark/50 max-h-[70vh] overflow-y-auto">
                    {notifications.map(notif => (
                        <li 
                            key={notif.id} 
                            className={`p-4 hover:bg-brixium-purple/10 transition-colors cursor-pointer ${!notif.read ? 'bg-brixium-purple/5' : ''}`}
                            onClick={() => handleNotificationClick(notif)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                    <span className="mr-3 mt-1">{getIconForType(notif.type)}</span>
                                    <div>
                                        <p className={`font-medium ${!notif.read ? 'text-white' : 'text-brixium-gray-light'}`}>{notif.message}</p>
                                        <p className="text-xs text-brixium-gray">{new Date(notif.createdAt).toLocaleString()}</p>
                                    </div>
                                
                                </div>
                                {!notif.read && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); markNotificationAsRead(notif.id);}}
                                        className="text-xs text-blue-400 hover:text-blue-300 ml-4 whitespace-nowrap"
                                        title="Mark as read"
                                    >
                                       <Check size={16} className="inline"/> Mark Read
                                    </button>
                                )}
                            </div>
                             {notif.linkTo && <p className="text-xs text-brixium-purple-light mt-1 pl-8 hover:underline">Go to details</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminNotificationsLogPage;
    