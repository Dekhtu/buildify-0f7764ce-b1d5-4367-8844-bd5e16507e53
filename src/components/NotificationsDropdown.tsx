
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markNotificationAsRead } from '@/lib/supabase';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';

type Notification = {
  id: string;
  content: string;
  type: string;
  created_at: string;
  is_read: boolean;
  video_id: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
};

const NotificationsDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'upload':
        return `/app/video/${notification.video_id}`;
      case 'comment':
        return `/app/video/${notification.video_id}?comment=true`;
      case 'subscription':
        return `/app/channel/${notification.profiles?.username}`;
      default:
        return '#';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <Link 
                key={notification.id} 
                to={getNotificationLink(notification)}
                onClick={() => handleNotificationClick(notification)}
              >
                <DropdownMenuItem className={`flex items-start p-3 cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}>
                  <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
                    <AvatarImage src={notification.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {notification.profiles?.username?.charAt(0).toUpperCase() || 'N'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{notification.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </DropdownMenuItem>
              </Link>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="text-center cursor-pointer">
            <Button variant="ghost" size="sm" onClick={fetchNotifications}>
              Refresh
            </Button>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;