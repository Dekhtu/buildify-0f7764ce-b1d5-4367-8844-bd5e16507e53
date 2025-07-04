
import React, { useState, useRef } from 'react';
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
import { Upload, X, Image, Clock } from 'lucide-react';

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
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

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
          published_at: schedulePublish ? new Date(publishDate).toISOString() : new Date().toISOString()
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
    </div>
  );
};

export default UploadPage;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
      
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
    </div>
  );
};

export default UploadPage;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
      
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
    </div>
  );
};

export default UploadPage;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
      
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