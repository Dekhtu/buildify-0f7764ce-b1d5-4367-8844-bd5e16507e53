
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    views: number;
    created_at: string;
    duration: number | null;
    profiles: {
      username: string;
      avatar_url: string | null;
      is_verified: boolean;
    };
  };
  isShort?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isShort = false }) => {
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

  if (isShort) {
    return (
      <Link to={`/app/video/${video.id}`} className="block">
        <div className="relative h-[320px] rounded-lg overflow-hidden group">
          <img 
            src={video.thumbnail_url || '/placeholder.svg'} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <h3 className="text-white font-medium line-clamp-2">{video.title}</h3>
            <div className="flex items-center mt-1">
              <p className="text-xs text-white/80">{formatViews(video.views)} views</p>
            </div>
          </div>
          <Badge variant="secondary" className="absolute top-2 right-2">
            Short
          </Badge>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/app/video/${video.id}`} className="block">
      <div className="space-y-2">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img 
            src={video.thumbnail_url || '/placeholder.svg'} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={video.profiles.avatar_url || ''} />
            <AvatarFallback>{video.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div>
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
      </div>
    </Link>
  );
};

export default VideoCard;