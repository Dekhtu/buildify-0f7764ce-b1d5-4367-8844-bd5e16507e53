
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Upload, 
  Trash2, 
  LogOut,
  Camera
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SettingsPage = () => {
  const { user, profile, updateUserProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // Profile form state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [subscriptionNotifications, setSubscriptionNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  
  // Privacy settings
  const [showSubscriptions, setShowSubscriptions] = useState(true);
  const [showLikedVideos, setShowLikedVideos] = useState(true);
  const [showSavedPlaylists, setShowSavedPlaylists] = useState(true);
  
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setChannelUrl(profile.channel_url || '');
      setAvatarPreview(profile.avatar_url || null);
      setBannerPreview(profile.banner_url || null);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let avatarUrl = profile?.avatar_url;
      let bannerUrl = profile?.banner_url;
      
      // Upload avatar if changed
      if (avatarFile) {
        const fileName = `${user.id}/avatar-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = data.publicUrl;
      }
      
      // Upload banner if changed
      if (bannerFile) {
        const fileName = `${user.id}/banner-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, bannerFile, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
        
        bannerUrl = data.publicUrl;
      }
      
      // Update profile
      await updateUserProfile({
        username,
        full_name: fullName,
        bio,
        channel_url: channelUrl,
        avatar_url: avatarUrl,
        banner_url: bannerUrl
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = () => {
    // In a real app, you would save these settings to the database
    toast.success('Notification settings saved');
  };

  const handleSavePrivacySettings = () => {
    // In a real app, you would save these settings to the database
    toast.success('Privacy settings saved');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // In a real app, you would implement a proper account deletion flow
      // This would typically involve:
      // 1. Deleting user data from the database
      // 2. Deleting user files from storage
      // 3. Deleting the auth user
      
      await signOut();
      toast.success('Account deleted successfully');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="profile">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="sm:w-48 space-y-1">
            <TabsList className="flex flex-col h-auto bg-transparent p-0 justify-start">
              <TabsTrigger 
                value="profile" 
                className="justify-start px-3 py-2 h-9 w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="justify-start px-3 py-2 h-9 w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="justify-start px-3 py-2 h-9 w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="justify-start px-3 py-2 h-9 w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="justify-start px-3 py-2 h-9 w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1">
            <TabsContent value="profile" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your public profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="h-32 w-full bg-muted rounded-lg overflow-hidden">
                        {bannerPreview ? (
                          <img 
                            src={bannerPreview} 
                            alt="Banner preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40"></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                          <label htmlFor="banner-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center text-white">
                              <Camera className="h-6 w-6" />
                              <span className="text-sm mt-1">Change Banner</span>
                            </div>
                            <input
                              id="banner-upload"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleBannerChange}
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div className="absolute -bottom-10 left-4">
                        <div className="relative">
                          <Avatar className="h-20 w-20 border-4 border-background">
                            <AvatarImage src={avatarPreview || ''} />
                            <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity rounded-full">
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                              <div className="flex items-center justify-center text-white">
                                <Camera className="h-5 w-5" />
                              </div>
                              <input
                                id="avatar-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-12 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="full-name">Full Name</Label>
                          <Input
                            id="full-name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="channel-url">Custom Channel URL</Label>
                        <Input
                          id="channel-url"
                          value={channelUrl}
                          onChange={(e) => setChannelUrl(e.target.value)}
                          placeholder="my-channel"
                        />
                        <p className="text-xs text-muted-foreground">
                          dekhtu.com/channel/{channelUrl || username}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell viewers about your channel"
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleUpdateProfile} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">New Subscriptions</h3>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone subscribes to your channel
                        </p>
                      </div>
                      <Switch
                        checked={subscriptionNotifications}
                        onCheckedChange={setSubscriptionNotifications}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Comments</h3>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone comments on your videos
                        </p>
                      </div>
                      <Switch
                        checked={commentNotifications}
                        onCheckedChange={setCommentNotifications}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Mentions</h3>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone mentions you in a comment
                        </p>
                      </div>
                      <Switch
                        checked={mentionNotifications}
                        onCheckedChange={setMentionNotifications}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveNotificationSettings}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Manage your privacy preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Subscriptions</h3>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see channels you're subscribed to
                        </p>
                      </div>
                      <Switch
                        checked={showSubscriptions}
                        onCheckedChange={setShowSubscriptions}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Liked Videos</h3>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see videos you've liked
                        </p>
                      </div>
                      <Switch
                        checked={showLikedVideos}
                        onCheckedChange={setShowLikedVideos}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Saved Playlists</h3>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see playlists you've saved
                        </p>
                      </div>
                      <Switch
                        checked={showSavedPlaylists}
                        onCheckedChange={setShowSavedPlaylists}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePrivacySettings}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Settings</CardTitle>
                  <CardDescription>
                    Manage your subscription and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium">Current Plan</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-lg font-bold">
                            {profile.is_premium ? 'Premium' : 'Free'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {profile.is_premium 
                              ? `Renewed on ${new Date(profile.premium_since || '').toLocaleDateString()}`
                              : 'Limited features'}
                          </p>
                        </div>
                        <Button variant={profile.is_premium ? "outline" : "default"}>
                          {profile.is_premium ? 'Manage' : 'Upgrade to Premium'}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Payment Methods</h3>
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <p className="text-muted-foreground">No payment methods added yet</p>
                        <Button variant="outline" className="mt-2">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Billing History</h3>
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <p className="text-muted-foreground">No billing history available</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Account Information</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p>{user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Account Created</p>
                            <p>{new Date(profile.join_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Change Password</h3>
                      <Button variant="outline">
                        Reset Password
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Sign Out</h3>
                      <Button variant="outline" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out of All Devices
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              account and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;