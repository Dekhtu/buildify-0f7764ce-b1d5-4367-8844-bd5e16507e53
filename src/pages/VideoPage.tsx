
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getVideo, 
  getVideos, 
  incrementVideoView, 
  toggleVideoLike, 
  toggleSubscription 
} from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import VideoCard from '@/components/VideoCard';
import CommentSection from '@/components/CommentSection';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Save, 
  MoreVertical,
  Flag,
  CheckCircle2,
  Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const showComments = searchParams.get('comment') === 'true';
  const { user } = useAuth();
  const [video, setVideo] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const videoData = await getVideo(id);
        setVideo(videoData);
        
        // Increment view count
        await incrementVideoView(id);
        
        // Fetch related videos (same category or from same creator)
        const related = await getVideos({
          category: videoData.category,
          limit: 10
        });
        
        // Filter out the current video
        setRelatedVideos(related.filter((v: any) => v.id !== id));
        
        // Check if user has liked the video
        // This would require a separate query in a real app
        setLiked(false);
        
        // Check if user is subscribed to the channel
        // This would require a separate query in a real app
        setSubscribed(false);
      } catch (error) {
        console.error('Error fetching video:', error);
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      toast('Please sign in to like videos');
      return;
    }
    
    try {
      if (!id) return;
      const result = await toggleVideoLike(id, user.id);
      setLiked(result === 'liked');
      
      // Update video likes count
      setVideo(prev => ({
        ...prev,
        likes: result === 'liked' ? prev.likes + 1 : prev.likes - 1
      }));
      
      toast.success(result === 'liked' ? 'Video liked' : 'Like removed');
    } catch (error) {
      console.error('Error liking video:', error);
      toast.error('Failed to like video');
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast('Please sign in to subscribe');
      return;
    }
    
    try {
      if (!video?.profiles?.id) return;
      const result = await toggleSubscription(video.profiles.id, user.id);
      setSubscribed(result === 'subscribed');
      
      // Update subscriber count
      setVideo(prev => ({
        ...prev,
        profiles: {
          ...prev.profiles,
          total_subscribers: result === 'subscribed' 
            ? prev.profiles.total_subscribers + 1 
            : prev.profiles.total_subscribers - 1
        }
      }));
      
      toast.success(result === 'subscribed' ? 'Subscribed to channel' : 'Unsubscribed from channel');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: `Check out this video: ${video?.title}`,
        url: window.location.href,
      })
      .catch(error => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'));
    }
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

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex space-x-2">
                <Skeleton className="h-24 w-40 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4 mt-1" />
                  <Skeleton className="h-3 w-1/2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Video not found</h2>
          <p className="text-muted-foreground mt-2">The video you're looking for doesn't exist or has been removed.</p>
          <Link to="/app">
            <Button className="mt-4">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef}
              src={video.video_url}
              poster={video.thumbnail_url}
              controls
              className="w-full h-full"
            />
          </div>
          
          {/* Video Title */}
          <h1 className="text-2xl font-bold">{video.title}</h1>
          
          {/* Video Info & Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                <span>{formatViews(video.views)} views</span>
                <span className="mx-1">•</span>
                <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={liked ? "default" : "outline"} 
                size="sm" 
                onClick={handleLike}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {formatViews(video.likes)}
              </Button>
              
              <Button variant="outline" size="sm">
                <ThumbsDown className="h-4 w-4 mr-1" />
                {formatViews(video.dislikes)}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Separator />
          
          {/* Channel Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <Link to={`/app/channel/${video.profiles.id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={video.profiles.avatar_url || ''} />
                  <AvatarFallback>{video.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              
              <div>
                <Link to={`/app/channel/${video.profiles.id}`} className="flex items-center">
                  <h3 className="font-medium">{video.profiles.username}</h3>
                  {video.profiles.is_verified && (
                    <CheckCircle2 className="h-4 w-4 ml-1 text-blue-500" />
                  )}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatViews(video.profiles.total_subscribers)} subscribers
                </p>
              </div>
            </div>
            
            <Button 
              variant={subscribed ? "outline" : "default"}
              onClick={handleSubscribe}
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>
          
          {/* Description */}
          <div 
            className={`bg-muted/40 rounded-lg p-4 ${showDescription ? '' : 'max-h-24 overflow-hidden'}`}
            onClick={() => setShowDescription(!showDescription)}
          >
            <p className="whitespace-pre-line">{video.description}</p>
            {!showDescription && video.description && video.description.length > 100 && (
              <Button variant="ghost" size="sm" className="mt-2">
                Show more
              </Button>
            )}
          </div>
          
          {/* Comments */}
          <CommentSection videoId={video.id} initialExpanded={showComments} />
        </div>
        
        {/* Related Videos */}
        <div className="space-y-4">
          <h3 className="font-medium">Related Videos</h3>
          <div className="space-y-4">
            {relatedVideos.map(relatedVideo => (
              <div key={relatedVideo.id} className="flex space-x-2">
                <Link to={`/app/video/${relatedVideo.id}`} className="flex-shrink-0 w-40">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={relatedVideo.thumbnail_url || '/placeholder.svg'} 
                      alt={relatedVideo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div>
                  <Link to={`/app/video/${relatedVideo.id}`}>
                    <h4 className="font-medium line-clamp-2">{relatedVideo.title}</h4>
                  </Link>
                  <Link to={`/app/channel/${relatedVideo.profiles.id}`} className="flex items-center text-sm text-muted-foreground">
                    <span>{relatedVideo.profiles.username}</span>
                    {relatedVideo.profiles.is_verified && (
                      <CheckCircle2 className="h-3 w-3 ml-1 text-blue-500" />
                    )}
                  </Link>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{formatViews(relatedVideo.views)} views</span>
                    <span className="mx-1">•</span>
                    <span>{formatDistanceToNow(new Date(relatedVideo.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;