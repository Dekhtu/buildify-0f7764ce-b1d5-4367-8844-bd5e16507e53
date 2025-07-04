
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptions, getVideos } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VideoCard from '@/components/VideoCard';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getSubscriptions(user.id);
        setSubscriptions(data);
        
        // Fetch videos from all subscribed channels
        if (data.length > 0) {
          const channelIds = data.map(sub => sub.channel_id);
          const allVideos = await Promise.all(
            channelIds.map(id => getVideos({ userId: id, limit: 50 }))
          );
          
          // Flatten and sort by date
          const flattenedVideos = allVideos
            .flat()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setVideos(flattenedVideos);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  const handleChannelSelect = async (channelId: string | null) => {
    setSelectedChannel(channelId);
    
    try {
      if (channelId) {
        const channelVideos = await getVideos({ userId: channelId, limit: 50 });
        setVideos(channelVideos);
      } else {
        // Reset to all videos
        const channelIds = subscriptions.map(sub => sub.channel_id);
        const allVideos = await Promise.all(
          channelIds.map(id => getVideos({ userId: id, limit: 50 }))
        );
        
        const flattenedVideos = allVideos
          .flat()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setVideos(flattenedVideos);
      }
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      toast.error('Failed to load videos');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        
        <div className="flex overflow-x-auto space-x-2 pb-4">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-full flex-shrink-0" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[180px] w-full rounded-lg" />
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">No Subscriptions</h2>
          <p className="text-muted-foreground mt-2">You haven't subscribed to any channels yet.</p>
          <Link to="/app">
            <Button className="mt-4">Explore Channels</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Subscriptions</h1>
      
      <div className="flex overflow-x-auto space-x-2 pb-4">
        <Button
          variant={selectedChannel === null ? "default" : "outline"}
          className="rounded-full"
          onClick={() => handleChannelSelect(null)}
        >
          All
        </Button>
        
        {subscriptions.map(subscription => (
          <Button
            key={subscription.channel_id}
            variant={selectedChannel === subscription.channel_id ? "default" : "outline"}
            className="rounded-full flex items-center space-x-2"
            onClick={() => handleChannelSelect(subscription.channel_id)}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={subscription.profiles.avatar_url || ''} />
              <AvatarFallback>{subscription.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{subscription.profiles.username}</span>
            {subscription.profiles.is_verified && (
              <CheckCircle2 className="h-3 w-3 text-blue-500" />
            )}
          </Button>
        ))}
      </div>
      
      <Tabs defaultValue="videos">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="shorts">Shorts</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="mt-6">
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No videos</h3>
              <p className="text-muted-foreground mt-2">
                {selectedChannel 
                  ? "This channel hasn't uploaded any videos yet." 
                  : "Your subscribed channels haven't uploaded any videos yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos
                .filter(video => !video.is_short)
                .map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shorts" className="mt-6">
          {videos.filter(video => video.is_short).length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No shorts</h3>
              <p className="text-muted-foreground mt-2">
                {selectedChannel 
                  ? "This channel hasn't uploaded any shorts yet." 
                  : "Your subscribed channels haven't uploaded any shorts yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {videos
                .filter(video => video.is_short)
                .map(video => (
                  <div key={video.id}>
                    <VideoCard video={video} isShort />
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="live" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No live streams</h3>
            <p className="text-muted-foreground mt-2">
              {selectedChannel 
                ? "This channel isn't streaming right now." 
                : "None of your subscribed channels are streaming right now."}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionsPage;