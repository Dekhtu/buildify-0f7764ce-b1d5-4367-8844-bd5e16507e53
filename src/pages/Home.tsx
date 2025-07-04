
import { useState, useEffect } from 'react';
import { getVideos } from '@/lib/supabase';
import VideoCard from '@/components/VideoCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type Video = {
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

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [newVideos, setNewVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // Fetch trending videos (most viewed)
        const trending = await getVideos({ 
          limit: 8, 
          orderBy: 'views:desc' 
        });
        setTrendingVideos(trending);
        
        // Fetch recommended videos (random selection for now)
        const recommended = await getVideos({ 
          limit: 8 
        });
        setRecommendedVideos(recommended);
        
        // Fetch newest videos
        const newest = await getVideos({ 
          limit: 8, 
          orderBy: 'created_at:desc' 
        });
        setNewVideos(newest);
        
        // Fetch shorts
        const shortsVideos = await getVideos({ 
          limit: 8, 
          isShort: true 
        });
        setShorts(shortsVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="shorts">Shorts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Trending</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
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
                  ))
                ) : (
                  trendingVideos.map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))
                )}
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">Shorts</h2>
              <div className="flex overflow-x-auto space-x-4 pb-4">
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[320px] w-[180px] flex-shrink-0 rounded-lg" />
                  ))
                ) : (
                  shorts.map(video => (
                    <div key={video.id} className="w-[180px] flex-shrink-0">
                      <VideoCard video={video} isShort />
                    </div>
                  ))
                )}
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">Recommended</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
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
                  ))
                ) : (
                  recommendedVideos.map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))
                )}
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">New</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
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
                  ))
                ) : (
                  newVideos.map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))
                )}
              </div>
            </section>
          </div>
        </TabsContent>
        
        <TabsContent value="trending">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
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
              ))
            ) : (
              trendingVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recommended">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
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
              ))
            ) : (
              recommendedVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="new">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
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
              ))
            ) : (
              newVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="shorts">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading ? (
              Array(12).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-[320px] w-full rounded-lg" />
              ))
            ) : (
              shorts.map(video => (
                <div key={video.id}>
                  <VideoCard video={video} isShort />
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;