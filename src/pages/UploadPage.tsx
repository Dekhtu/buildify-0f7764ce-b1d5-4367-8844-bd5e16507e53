
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  Image, 
  Clock, 
  Film, 
  Play, 
  Pause, 
  SkipForward, 
  Camera, 
  Loader2,
  FileVideo,
  Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  'Music',
  'Gaming',
  'Movies',
  'News',
  'Learning',
  'Shopping',
  'Sports',
  'Technology',
  'Entertainment',
  'Travel',
  'Food',
  'Fashion',
  'Beauty',
  'Fitness',
  'Other'
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Portuguese',
  'Italian',
  'Other'
];

interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  codec?: string;
  bitrate?: number;
  fps?: number;
}

interface BatchUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  metadata?: VideoMetadata;
  thumbnails?: string[];
  videoId?: string;
  error?: string;
}

const UploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const [tags, setTags] = useState('');
  const [isShort, setIsShort] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [schedulePublish, setSchedulePublish] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  
  // New state for enhanced features
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({});
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([]);
  const [showThumbnailGenerator, setShowThumbnailGenerator] = useState(false);
  const [processingThumbnails, setProcessingThumbnails] = useState(false);
  const [batchUploadItems, setBatchUploadItems] = useState<BatchUploadItem[]>([]);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const batchUploadInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Extract metadata when video file changes
  useEffect(() => {
    if (videoFile) {
      extractMetadata(videoFile);
      setVideoPreviewUrl(URL.createObjectURL(videoFile));
    } else {
      setVideoMetadata({});
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
      }
    }
    
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoFile]);

  // Handle video player time updates
  useEffect(() => {
    const videoElement = videoPlayerRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoPlayerRef.current]);

  const extractMetadata = async (file: File) => {
    return new Promise<void>((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        };
        
        setVideoMetadata(metadata);
        
        // Auto-detect if it's a short video based on aspect ratio
        if (metadata.width && metadata.height) {
          setIsShort(metadata.height > metadata.width);
        }
        
        URL.revokeObjectURL(video.src);
        resolve();
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      
      // Auto-generate title from filename
      if (!title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setTitle(fileName.replace(/-|_/g, " ")); // Replace dashes and underscores with spaces
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handlePlayPause = () => {
    const video = videoPlayerRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    const video = videoPlayerRef.current;
    if (!video || !videoMetadata.duration) return;
    
    // Ensure time is within valid range
    const seekTime = Math.max(0, Math.min(time, videoMetadata.duration));
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleCaptureThumbnail = () => {
    const video = videoPlayerRef.current;
    if (!video) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setThumbnailPreview(thumbnailDataUrl);
    
    // Convert data URL to File object
    const arr = thumbnailDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    const thumbnailFile = new File([u8arr], `thumbnail-${Date.now()}.jpg`, { type: mime });
    setThumbnailFile(thumbnailFile);
  };

  const generateThumbnails = async () => {
    const video = videoPlayerRef.current;
    if (!video || !videoMetadata.duration) return;
    
    setProcessingThumbnails(true);
    
    try {
      const thumbnails: string[] = [];
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Generate 3 thumbnails at different points in the video
      const timestamps = [
        videoMetadata.duration * 0.25,
        videoMetadata.duration * 0.5,
        videoMetadata.duration * 0.75
      ];
      
      for (const timestamp of timestamps) {
        // Set video to the timestamp
        video.currentTime = timestamp;
        
        // Wait for the video to seek to the timestamp
        await new Promise<void>((resolve) => {
          const seekHandler = () => {
            video.removeEventListener('seeked', seekHandler);
            resolve();
          };
          
          video.addEventListener('seeked', seekHandler);
        });
        
        // Capture the frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        thumbnails.push(thumbnailDataUrl);
      }
      
      setGeneratedThumbnails(thumbnails);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      toast.error('Failed to generate thumbnails');
    } finally {
      setProcessingThumbnails(false);
    }
  };

  const selectGeneratedThumbnail = (dataUrl: string) => {
    setThumbnailPreview(dataUrl);
    
    // Convert data URL to File object
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    const thumbnailFile = new File([u8arr], `thumbnail-${Date.now()}.jpg`, { type: mime });
    setThumbnailFile(thumbnailFile);
    
    setShowThumbnailGenerator(false);
  };

  const handleBatchUploadSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    const newItems: BatchUploadItem[] = files.map((file) => ({
      id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      status: 'pending',
      progress: 0
    }));
    
    setBatchUploadItems((prev) => [...prev, ...newItems]);
  };

  const startBatchUpload = async () => {
    if (!user) {
      toast.error('You must be logged in to upload videos');
      return;
    }
    
    if (batchUploadItems.length === 0) {
      toast.error('Please select videos to upload');
      return;
    }
    
    // Get common metadata from the form
    const commonMetadata = {
      category,
      language,
      isPremium,
      allowComments,
      monetizationEnabled,
      schedulePublish,
      publishDate: schedulePublish ? publishDate : undefined
    };
    
    // Process each item in the batch
    for (const item of batchUploadItems.filter(item => item.status === 'pending')) {
      // Update item status to uploading
      setBatchUploadItems((prev) => 
        prev.map((i) => 
          i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i
        )
      );
      
      try {
        // Extract metadata
        await extractMetadataForBatchItem(item);
        
        // Upload the video
        await uploadBatchItem(item, commonMetadata);
        
        // Update item status to completed
        setBatchUploadItems((prev) => 
          prev.map((i) => 
            i.id === item.id ? { ...i, status: 'completed', progress: 100 } : i
          )
        );
        
        toast.success(`Uploaded: ${item.file.name}`);
      } catch (error) {
        console.error(`Error uploading ${item.file.name}:`, error);
        
        // Update item status to failed
        setBatchUploadItems((prev) => 
          prev.map((i) => 
            i.id === item.id ? { 
              ...i, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            } : i
          )
        );
        
        toast.error(`Failed to upload: ${item.file.name}`);
      }
    }
  };

  const extractMetadataForBatchItem = async (item: BatchUploadItem) => {
    return new Promise<void>((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        };
        
        // Update the batch item with metadata
        setBatchUploadItems((prev) => 
          prev.map((i) => 
            i.id === item.id ? { ...i, metadata, progress: 20 } : i
          )
        );
        
        URL.revokeObjectURL(video.src);
        resolve();
      };
      
      video.src = URL.createObjectURL(item.file);
    });
  };

  const uploadBatchItem = async (item: BatchUploadItem, commonMetadata: any) => {
    if (!user) throw new Error('User not authenticated');
    
    // Update progress
    setBatchUploadItems((prev) => 
      prev.map((i) => 
        i.id === item.id ? { ...i, progress: 30, status: 'uploading' } : i
      )
    );
    
    // Generate a title from the filename
    const fileName = item.file.name.replace(/\.[^/.]+$/, "");
    const autoTitle = fileName.replace(/-|_/g, " ");
    
    // Upload video file
    const videoFileName = `${user.id}/${Date.now()}-${item.file.name}`;
    const { data: videoData, error: videoError } = await supabase.storage
      .from('videos')
      .upload(videoFileName, item.file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          const uploadProgress = Math.floor((progress.loaded / progress.total) * 50) + 30;
          setBatchUploadItems((prev) => 
            prev.map((i) => 
              i.id === item.id ? { ...i, progress: uploadProgress } : i
            )
          );
        }
      });
    
    if (videoError) throw videoError;
    
    // Get video URL
    const { data: videoUrl } = supabase.storage
      .from('videos')
      .getPublicUrl(videoFileName);
    
    // Update progress
    setBatchUploadItems((prev) => 
      prev.map((i) => 
        i.id === item.id ? { ...i, progress: 80, status: 'processing' } : i
      )
    );
    
    // Create video record in database
    const { data: video, error: insertError } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        title: autoTitle,
        description: '',
        thumbnail_url: null, // No thumbnail for batch uploads
        video_url: videoUrl.publicUrl,
        category: commonMetadata.category || null,
        language: commonMetadata.language || 'English',
        tags: [],
        is_short: item.metadata?.height && item.metadata?.width 
          ? item.metadata.height > item.metadata.width 
          : false,
        is_premium: commonMetadata.isPremium || false,
        allow_comments: commonMetadata.allowComments !== undefined 
          ? commonMetadata.allowComments 
          : true,
        monetization_enabled: commonMetadata.monetizationEnabled || false,
        is_published: commonMetadata.schedulePublish ? false : true,
        published_at: commonMetadata.schedulePublish 
          ? new Date(commonMetadata.publishDate).toISOString() 
          : new Date().toISOString(),
        duration: item.metadata?.duration,
        width: item.metadata?.width,
        height: item.metadata?.height
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    // Update batch item with video ID
    setBatchUploadItems((prev) => 
      prev.map((i) => 
        i.id === item.id ? { ...i, videoId: video.id, progress: 100 } : i
      )
    );
  };

  const removeBatchItem = (id: string) => {
    setBatchUploadItems((prev) => prev.filter((item) => item.id !== id));
  };

  const retryBatchItem = (id: string) => {
    setBatchUploadItems((prev) => 
      prev.map((item) => 
        item.id === id ? { ...item, status: 'pending', progress: 0, error: undefined } : item
      )
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error('You must be logged in to upload videos');
      return;
    }
    
    if (!videoFile) {
      toast.error('Please select a video to upload');
      return;
    }
    
    if (!title) {
      toast.error('Please enter a title for your video');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Upload video file
      const videoFileName = `${user.id}/${Date.now()}-${videoFile.name}`;
      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });
      
      if (videoError) throw videoError;
      
      // Get video URL
      const { data: videoUrl } = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName);
      
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailFileName = `${user.id}/${Date.now()}-${thumbnailFile.name}`;
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailFileName, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (thumbnailError) throw thumbnailError;
        
        const { data: thumbUrl } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(thumbnailFileName);
        
        thumbnailUrl = thumbUrl.publicUrl;
      }
      
      // Create video record in database
      const { data: video, error: insertError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl.publicUrl,
          category,
          language,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          is_short: isShort,
          is_premium: isPremium,
          allow_comments: allowComments,
          monetization_enabled: monetizationEnabled,
          is_published: !schedulePublish,
          published_at: schedulePublish ? new Date(publishDate).toISOString() : new Date().toISOString(),
          duration: videoMetadata.duration,
          width: videoMetadata.width,
          height: videoMetadata.height
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      toast.success('Video uploaded successfully!');
      navigate(`/app/video/${video.id}`);
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
      
      <div className="flex justify-end mb-4 space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={() => setShowBatchUpload(!showBatchUpload)}
              >
                <FileVideo className="h-4 w-4 mr-2" />
                {showBatchUpload ? 'Single Upload' : 'Batch Upload'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch between single and batch upload modes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {showBatchUpload ? (
        <Card>
          <CardHeader>
            <CardTitle>Batch Upload</CardTitle>
            <CardDescription>
              Upload multiple videos at once with common settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => batchUploadInputRef.current?.click()}
            >
              <Plus className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Click to select multiple video files</p>
              <p className="text-sm text-muted-foreground mt-2">or drag and drop files here</p>
              <input
                type="file"
                ref={batchUploadInputRef}
                className="hidden"
                accept="video/*"
                multiple
                onChange={handleBatchUploadSelect}
              />
            </div>
            
            {batchUploadItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Selected Videos ({batchUploadItems.length})</h3>
                
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {batchUploadItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                            <Film className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-[200px]">{item.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                              {item.metadata?.duration && ` • ${formatDuration(item.metadata.duration)}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {item.status === 'failed' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => retryBatchItem(item.id)}
                            >
                              Retry
                            </Button>
                          )}
                          
                          {item.status === 'completed' && item.videoId && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/app/video/${item.videoId}`)}
                            >
                              View
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeBatchItem(item.id)}
                            disabled={item.status === 'uploading' || item.status === 'processing'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Progress value={item.progress} className="flex-1" />
                        
                        <Badge variant={
                          item.status === 'completed' ? 'default' :
                          item.status === 'failed' ? 'destructive' :
                          item.status === 'uploading' || item.status === 'processing' ? 'secondary' :
                          'outline'
                        }>
                          {item.status === 'uploading' && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {item.error && (
                        <p className="text-xs text-destructive mt-1">{item.error}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Common Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch-category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="batch-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="batch-language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="batch-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-premium"
                        checked={isPremium}
                        onCheckedChange={setIsPremium}
                      />
                      <Label htmlFor="batch-premium">Premium content</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-comments"
                        checked={allowComments}
                        onCheckedChange={setAllowComments}
                      />
                      <Label htmlFor="batch-comments">Allow comments</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-monetization"
                        checked={monetizationEnabled}
                        onCheckedChange={setMonetizationEnabled}
                      />
                      <Label htmlFor="batch-monetization">Enable monetization</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-schedule"
                        checked={schedulePublish}
                        onCheckedChange={setSchedulePublish}
                      />
                      <Label htmlFor="batch-schedule">Schedule for later</Label>
                    </div>
                    
                    {schedulePublish && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="batch-publish-date">Publish date and time</Label>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="batch-publish-date"
                            type="datetime-local"
                            value={publishDate}
                            onChange={(e) => setPublishDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/app')}>
              Cancel
            </Button>
            <Button 
              onClick={startBatchUpload} 
              disabled={batchUploadItems.length === 0 || batchUploadItems.every(item => item.status !== 'pending')}
            >
              Start Batch Upload
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="upload">
          <TabsList className="mb-6">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Select Video File</CardTitle>
                <CardDescription>
                  Upload a video file from your device. Supported formats: MP4, MOV, AVI, WebM.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!videoFile ? (
                  <div 
                    className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">Click to select a video file</p>
                    <p className="text-sm text-muted-foreground mt-2">or drag and drop a file here</p>
                    <p className="text-xs text-muted-foreground mt-4">Maximum file size: 2GB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                            <video className="h-full w-full object-cover rounded" />
                          </div>
                          <div>
                            <p className="font-medium">{videoFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                              {videoMetadata.duration && ` • ${formatDuration(videoMetadata.duration)}`}
                              {videoMetadata.width && videoMetadata.height && 
                                ` • ${videoMetadata.width}x${videoMetadata.height}`}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={handleRemoveVideo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {isUploading && (
                        <div className="mt-4">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            {uploadProgress.toFixed(0)}% uploaded
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Video Preview */}
                    {videoPreviewUrl && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="relative">
                          <video 
                            ref={videoPlayerRef}
                            src={videoPreviewUrl} 
                            className="w-full h-auto"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                          />
                          
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-white hover:text-white hover:bg-white/20"
                              onClick={handlePlayPause}
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            
                            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-white rounded-full"
                                style={{ 
                                  width: videoMetadata.duration 
                                    ? `${(currentTime / videoMetadata.duration) * 100}%` 
                                    : '0%' 
                                }}
                              />
                            </div>
                            
                            <span className="text-xs">
                              {formatDuration(currentTime)} / {formatDuration(videoMetadata.duration)}
                            </span>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-white hover:text-white hover:bg-white/20"
                                    onClick={handleCaptureThumbnail}
                                  >
                                    <Camera className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Capture current frame as thumbnail</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-white hover:text-white hover:bg-white/20"
                                    onClick={() => setShowThumbnailGenerator(true)}
                                  >
                                    <SkipForward className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Generate thumbnails automatically</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="short-video"
                    checked={isShort}
                    onCheckedChange={setIsShort}
                  />
                  <Label htmlFor="short-video">This is a short video (vertical format)</Label>
                </div>
                
                {/* Thumbnail Generator Dialog */}
                <Dialog open={showThumbnailGenerator} onOpenChange={setShowThumbnailGenerator}>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Generate Thumbnails</DialogTitle>
                      <DialogDescription>
                        Automatically generate thumbnails from your video
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      {processingThumbnails ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p>Generating thumbnails...</p>
                        </div>
                      ) : generatedThumbnails.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                          {generatedThumbnails.map((thumbnail, index) => (
                            <div 
                              key={index}
                              className="border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                              onClick={() => selectGeneratedThumbnail(thumbnail)}
                            >
                              <img 
                                src={thumbnail} 
                                alt={`Thumbnail ${index + 1}`} 
                                className="w-full h-auto"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Button 
                          onClick={generateThumbnails}
                          className="w-full py-8"
                        >
                          Generate Thumbnails
                        </Button>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowThumbnailGenerator(false)}>
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/app')}>
                  Cancel
                </Button>
                <Button onClick={() => document.querySelector('[data-value="details"]')?.click()}>
                  Next: Details
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
                <CardDescription>
                  Add information about your video to help viewers find it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title (required)</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a title that describes your video"
                        maxLength={100}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {title.length}/100
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell viewers about your video"
                        className="min-h-[120px]"
                        maxLength={5000}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {description.length}/5000
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Thumbnail</Label>
                      <div 
                        className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => thumbnailInputRef.current?.click()}
                      >
                        {thumbnailPreview ? (
                          <div className="relative aspect-video">
                            <img 
                              src={thumbnailPreview} 
                              alt="Thumbnail preview" 
                              className="w-full h-full object-cover"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveThumbnail();
                              }}
                            >
                              <X className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            <Image className="h-12 w-12 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground ml-2">Add thumbnail</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={thumbnailInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: 1280x720 (16:9)
                      </p>
                      
                      {videoPreviewUrl && !thumbnailPreview && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => setShowThumbnailGenerator(true)}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Generate from Video
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Add tags separated by commas (e.g. music, guitar, tutorial)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tags help viewers find your video
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => document.querySelector('[data-value="upload"]')?.click()}>
                  Back
                </Button>
                <Button onClick={() => document.querySelector('[data-value="visibility"]')?.click()}>
                  Next: Visibility
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="visibility">
            <Card>
              <CardHeader>
                <CardTitle>Visibility Settings</CardTitle>
                <CardDescription>
                  Choose when to publish and who can see your video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="schedule"
                      checked={schedulePublish}
                      onCheckedChange={setSchedulePublish}
                    />
                    <Label htmlFor="schedule">Schedule for later</Label>
                  </div>
                  
                  {schedulePublish && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="publish-date">Publish date and time</Label>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="publish-date"
                          type="datetime-local"
                          value={publishDate}
                          onChange={(e) => setPublishDate(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="premium"
                      checked={isPremium}
                      onCheckedChange={setIsPremium}
                    />
                    <div>
                      <Label htmlFor="premium">Premium content</Label>
                      <p className="text-sm text-muted-foreground">
                        Only premium subscribers can watch this video
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="comments"
                      checked={allowComments}
                      onCheckedChange={setAllowComments}
                    />
                    <div>
                      <Label htmlFor="comments">Allow comments</Label>
                      <p className="text-sm text-muted-foreground">
                        Viewers can comment on your video
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monetization"
                      checked={monetizationEnabled}
                      onCheckedChange={setMonetizationEnabled}
                    />
                    <div>
                      <Label htmlFor="monetization">Enable monetization</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow ads to be shown on your video
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => document.querySelector('[data-value="details"]')?.click()}>
                  Back
                </Button>
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default UploadPage;