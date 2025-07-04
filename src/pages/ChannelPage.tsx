
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, getVideos, toggleSubscription } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import VideoCard from '@/components/VideoCard';
import { CheckCircle2, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

const ChannelPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const isOwnChannel = user?.id === id;

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch channel profile
        const profileData = await getProfile(id);
        setProfile(profileData);
        
        // Fetch channel videos
        const videosData = await getVideos({ 
          userId: id,
          isShort: false
        });
        setVideos(videosData);
        
        // Fetch channel shorts
        const shortsData = await getVideos({ 
          userId: id,
          isShort: true
        });
        setShorts(shortsData);
        
        // Check if user is subscribed to the channel
        // This would require a separate query in a real app
        setSubscribed(false);
      } catch (error) {
        console.error('Error fetching channel data:', error);
        toast.error('Failed to load channel');
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [id]);

  const handleSubscribe = async () => {
    if (!user) {
      toast('Please sign in to subscribe');
      return;
    }
    
    try {
      if (!id) return;
      const result = await toggleSubscription(id, user.id);
      setSubscribed(result === 'subscribed');
      
      // Update subscriber count
      setProfile(prev => ({
        ...prev,
        total_subscribers: result === 'subscribed' 
          ? prev.total_subscribers + 1 
          : prev.total_subscribers - 1
      }));
      
      toast.success(result === 'subscribed' ? 'Subscribed to channel' : 'Unsubscribed from channel');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe');
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(notificationsEnabled 
      ? 'Notifications turned off for this channel' 
      : 'Notifications turned on for this channel'
    );
  };

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        
        <Skeleton className="h-12 w-96" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[180px] w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Channel not found</h2>
          <p className="text-muted-foreground mt-2">The channel you're looking for doesn't exist or has been removed.</p>
          <Link to="/app">
            <Button className="mt-4">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Channel Banner */}
      <div className="relative h-40 rounded-lg overflow-hidden bg-muted">
        {profile.banner_url ? (
          <img 
            src={profile.banner_url} 
            alt={`${profile.username}'s banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40"></div>
        )}
      </div>
      
      {/* Channel Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {profile.is_verified && (
                <CheckCircle2 className="h-5 w-5 ml-2 text-blue-500" />
              )}
            </div>
            <div className="text-muted-foreground">
              <span>{formatSubscribers(profile.total_subscribers)} subscribers</span>
              <span className="mx-2">•</span>
              <span>{videos.length + shorts.length} videos</span>
            </div>
            {profile.bio && (
              <p className="mt-2 text-sm line-clamp-2">{profile.bio}</p>
            )}
          </div>
        </div>
        
        {!isOwnChannel && (
          <div className="flex items-center space-x-2">
            <Button 
              variant={subscribed ? "outline" : "default"}
              onClick={handleSubscribe}
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
            
            {subscribed && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleNotifications}
                title={notificationsEnabled ? 'Turn off notifications' : 'Turn on notifications'}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            )}
          </div>
        )}
        
        {isOwnChannel && (
          <Link to="/app/settings">
            <Button variant="outline">Customize Channel</Button>
          </Link>
        )}
      </div>
      
      {/* Channel Content */}
      <Tabs defaultValue="videos">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="shorts">Shorts</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="mt-6">
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No videos yet</h3>
              <p className="text-muted-foreground mt-2">This channel hasn't uploaded any videos.</p>
              {isOwnChannel && (
                <Link to="/app/upload">
                  <Button className="mt-4">Upload a Video</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shorts" className="mt-6">
          {shorts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No shorts yet</h3>
              <p className="text-muted-foreground mt-2">This channel hasn't uploaded any shorts.</p>
              {isOwnChannel && (
                <Link to="/app/upload">
                  <Button className="mt-4">Upload a Short</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {shorts.map(video => (
                <div key={video.id}>
                  <VideoCard video={video} isShort />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="playlists" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No playlists yet</h3>
            <p className="text-muted-foreground mt-2">This channel hasn't created any playlists.</p>
            {isOwnChannel && (
              <Button className="mt-4">Create a Playlist</Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="about" className="mt-6">
          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="whitespace-pre-line">{profile.bio || 'No description provided.'}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Stats</h3>
              <p>Joined {new Date(profile.join_date).toLocaleDateString()}</p>
              <p>{formatSubscribers(profile.total_subscribers)} subscribers</p>
              <p>{profile.total_views} total views</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChannelPage;