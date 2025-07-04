
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Home, 
  Compass, 
  Clock, 
  ThumbsUp, 
  PlaySquare, 
  ListVideo,
  Users,
  Flame,
  Music,
  Gamepad2,
  Film,
  Newspaper,
  Lightbulb,
  ShoppingBag,
  Radio,
  Award
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const { user } = useAuth();

  if (!open) {
    return null;
  }

  return (
    <aside className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <ScrollArea className="h-full py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link to="/app">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/app/explore">
              <Button variant="ghost" className="w-full justify-start">
                <Compass className="mr-2 h-4 w-4" />
                Explore
              </Button>
            </Link>
            <Link to="/app/subscriptions">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Subscriptions
              </Button>
            </Link>
          </div>
          
          <Separator className="my-4" />
          
          {user && (
            <>
              <div className="space-y-1">
                <Link to={`/app/channel/${user.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <PlaySquare className="mr-2 h-4 w-4" />
                    Your Channel
                  </Button>
                </Link>
                <Link to="/app/history">
                  <Button variant="ghost" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    History
                  </Button>
                </Link>
                <Link to="/app/liked">
                  <Button variant="ghost" className="w-full justify-start">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Liked Videos
                  </Button>
                </Link>
                <Link to="/app/playlists">
                  <Button variant="ghost" className="w-full justify-start">
                    <ListVideo className="mr-2 h-4 w-4" />
                    Playlists
                  </Button>
                </Link>
              </div>
              
              <Separator className="my-4" />
            </>
          )}
          
          <div className="space-y-1">
            <h3 className="px-4 text-sm font-semibold">Explore</h3>
            <Link to="/app/trending">
              <Button variant="ghost" className="w-full justify-start">
                <Flame className="mr-2 h-4 w-4" />
                Trending
              </Button>
            </Link>
            <Link to="/app/category/music">
              <Button variant="ghost" className="w-full justify-start">
                <Music className="mr-2 h-4 w-4" />
                Music
              </Button>
            </Link>
            <Link to="/app/category/gaming">
              <Button variant="ghost" className="w-full justify-start">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Gaming
              </Button>
            </Link>
            <Link to="/app/category/movies">
              <Button variant="ghost" className="w-full justify-start">
                <Film className="mr-2 h-4 w-4" />
                Movies
              </Button>
            </Link>
            <Link to="/app/category/news">
              <Button variant="ghost" className="w-full justify-start">
                <Newspaper className="mr-2 h-4 w-4" />
                News
              </Button>
            </Link>
            <Link to="/app/category/learning">
              <Button variant="ghost" className="w-full justify-start">
                <Lightbulb className="mr-2 h-4 w-4" />
                Learning
              </Button>
            </Link>
            <Link to="/app/category/shopping">
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Shopping
              </Button>
            </Link>
            <Link to="/app/category/podcasts">
              <Button variant="ghost" className="w-full justify-start">
                <Radio className="mr-2 h-4 w-4" />
                Podcasts
              </Button>
            </Link>
            <Link to="/app/category/sports">
              <Button variant="ghost" className="w-full justify-start">
                <Award className="mr-2 h-4 w-4" />
                Sports
              </Button>
            </Link>
          </div>
          
          <Separator className="my-4" />
          
          <div className="px-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-2 py-1">
              <Link to="/terms" className="hover:underline">Terms</Link>
              <Link to="/privacy" className="hover:underline">Privacy</Link>
              <Link to="/policy" className="hover:underline">Policy</Link>
              <Link to="/safety" className="hover:underline">Safety</Link>
              <Link to="/feedback" className="hover:underline">Feedback</Link>
            </div>
            <p className="py-1">© 2025 Dekhtu</p>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;