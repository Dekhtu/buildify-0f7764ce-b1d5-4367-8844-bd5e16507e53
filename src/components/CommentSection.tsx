
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getComments, addComment } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { ThumbsUp, ThumbsDown, MoreVertical, Flag, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

interface CommentSectionProps {
  videoId: string;
  initialExpanded?: boolean;
}

type Comment = {
  id: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: string;
  is_pinned: boolean;
  profiles: {
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
};

const CommentSection: React.FC<CommentSectionProps> = ({ videoId, initialExpanded = false }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(initialExpanded);

  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [expanded, videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getComments(videoId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim()) return;
    
    try {
      setSubmitting(true);
      const newComment = await addComment(videoId, user.id, commentText);
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatLikes = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{comments.length} Comments</h3>
        <Button 
          variant="ghost" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide comments' : 'Show comments'}
        </Button>
      </div>
      
      {expanded && (
        <>
          {user && (
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder="Add a comment..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCommentText('')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    disabled={!commentText.trim() || submitting}
                    onClick={handleSubmitComment}
                  >
                    {submitting ? 'Posting...' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.profiles.avatar_url || ''} />
                    <AvatarFallback>{comment.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <span className="font-medium">{comment.profiles.username}</span>
                        {comment.profiles.is_verified && (
                          <CheckCircle2 className="h-3 w-3 ml-1 text-blue-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {comment.is_pinned && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Pinned</span>
                      )}
                    </div>
                    <p className="mt-1">{comment.content}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">{formatLikes(comment.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">{formatLikes(comment.dislikes)}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8">
                        Reply
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentSection;