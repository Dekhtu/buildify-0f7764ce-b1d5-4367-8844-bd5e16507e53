
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPlaylistVideos } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Clock, ListVideo, MoreVertical, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getPlaylistVideos(id);
        
        if (data.length > 0) {
          // Extract playlist info from the first item
          const playlistInfo = {
            id: data[0].playlist_id,
            title: data[0].videos.title,
            description: data[0].videos.description,
            thumbnail_url: data[0].videos.thumbnail_url,
            user_id: data[0].videos.user_id,
            username: data[0].videos.profiles.username,
            avatar_url: data[0].videos.profiles.avatar_url,
            is_verified: data[0].videos.profiles.is_verified,
          };
          
          setPlaylist(playlistInfo);
          
          // Extract videos
          const playlistVideos = data.map(item => ({
            ...item.videos,
            position: item.position
          }));
          
          setVideos(playlistVideos);
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
        toast.error('Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getTotalDuration = () => {
    const totalSeconds = videos.reduce((total, video) => {
      return total + (video.duration || 0);
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-48 w-full md:w-80 rounded-lg" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-20 w-36 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!playlist || videos.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Playlist not found</h2>
          <p className="text-muted-foreground mt-2">The playlist you're looking for doesn't exist or has been removed.</p>
          <Link to="/app">
            <Button className="mt-4">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-80">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            <img 
              src={playlist.thumbnail_url || '/placeholder.svg'} 
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button size="lg" className="rounded-full">
                <Play className="h-6 w-6 mr-2" />
                Play All
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">{playlist.title}</h1>
          
          <div className="flex items-center space-x-4">
            <Link to={`/app/channel/${playlist.user_id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={playlist.avatar_url || ''} />
                <AvatarFallback>{playlist.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
            
            <Link to={`/app/channel/${playlist.user_id}`} className="flex items-center">
              <span className="font-medium">{playlist.username}</span>
              {playlist.is_verified && (
                <CheckCircle2 className="h-4 w-4 ml-1 text-blue-500" />
              )}
            </Link>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center">
              <ListVideo className="h-4 w-4 mr-1" />
              <span>{videos.length} videos</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{getTotalDuration()}</span>
            </div>
          </div>
          
          {playlist.description && (
            <p className="text-sm text-muted-foreground">{playlist.description}</p>
          )}
          
          <div className="flex space-x-2">
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Play All
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Save to Watch Later</DropdownMenuItem>
                <DropdownMenuItem>Share Playlist</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {videos.map((video, index) => (
          <Link key={video.id} to={`/app/video/${video.id}`}>
            <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="text-muted-foreground font-medium w-6 text-center">
                {video.position}
              </div>
              
              <div className="relative aspect-video w-36 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={video.thumbnail_url || '/placeholder.svg'} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                {video.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium line-clamp-2">{video.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{video.profiles.username}</span>
                  {video.profiles.is_verified && (
                    <CheckCircle2 className="h-3 w-3 ml-1 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{formatViews(video.views)} views</span>
                  <span className="mx-1">•</span>
                  <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;