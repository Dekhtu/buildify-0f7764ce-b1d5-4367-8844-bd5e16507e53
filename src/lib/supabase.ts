
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://vywcqvqwljtnozyoebyr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5d2NxdnF3bGp0bm96eW9lYnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTc0OTMsImV4cCI6MjA2NzE5MzQ5M30.no3YdczanjLayNJghUD6WfY6ZYrWZnVdjQ6KwTXycNc';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getVideos = async (options: {
  limit?: number;
  category?: string;
  isShort?: boolean;
  userId?: string;
  orderBy?: string;
} = {}) => {
  let query = supabase
    .from('videos')
    .select('*, profiles(username, avatar_url, is_verified)')
    .eq('is_published', true);
  
  if (options.category) {
    query = query.eq('category', options.category);
  }
  
  if (options.isShort !== undefined) {
    query = query.eq('is_short', options.isShort);
  }
  
  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }
  
  if (options.orderBy) {
    const [column, order] = options.orderBy.split(':');
    query = query.order(column, { ascending: order === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const getVideo = async (videoId: string) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*, profiles(id, username, avatar_url, is_verified, total_subscribers)')
    .eq('id', videoId)
    .single();
  
  if (error) throw error;
  return data;
};

export const incrementVideoView = async (videoId: string) => {
  const { error } = await supabase.rpc('increment_video_view', { video_uuid: videoId });
  if (error) throw error;
};

export const toggleVideoLike = async (videoId: string, userId: string) => {
  const { data, error } = await supabase.rpc('toggle_video_like', { 
    video_uuid: videoId,
    user_uuid: userId
  });
  
  if (error) throw error;
  return data;
};

export const toggleSubscription = async (channelId: string, userId: string) => {
  const { data, error } = await supabase.rpc('toggle_subscription', { 
    channel_uuid: channelId,
    subscriber_uuid: userId
  });
  
  if (error) throw error;
  return data;
};

export const getComments = async (videoId: string, parentId: string | null = null) => {
  let query = supabase
    .from('comments')
    .select('*, profiles(username, avatar_url, is_verified)')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });
  
  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const addComment = async (videoId: string, userId: string, content: string, parentId: string | null = null) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      video_id: videoId,
      user_id: userId,
      content,
      parent_id: parentId
    })
    .select('*, profiles(username, avatar_url, is_verified)')
    .single();
  
  if (error) throw error;
  return data;
};

export const getPlaylists = async (userId: string, isPublic: boolean = true) => {
  let query = supabase
    .from('playlists')
    .select('*');
  
  if (isPublic) {
    query = query.eq('is_public', true);
  } else {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const getPlaylistVideos = async (playlistId: string) => {
  const { data, error } = await supabase
    .from('playlist_videos')
    .select('*, videos(*, profiles(username, avatar_url, is_verified))')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const addVideoToPlaylist = async (playlistId: string, videoId: string, position: number) => {
  const { data, error } = await supabase
    .from('playlist_videos')
    .insert({
      playlist_id: playlistId,
      video_id: videoId,
      position
    })
    .select();
  
  if (error) throw error;
  return data;
};

export const getSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, profiles:channel_id(id, username, avatar_url, is_verified, total_subscribers)')
    .eq('subscriber_id', userId);
  
  if (error) throw error;
  return data;
};

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, profiles:sender_id(username, avatar_url, is_verified)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select();
  
  if (error) throw error;
  return data;
};

export const getChats = async (userId: string) => {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      chat_participants!inner(user_id),
      messages(
        id,
        content,
        created_at,
        sender_id,
        is_read
      )
    `)
    .eq('chat_participants.user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles:sender_id(username, avatar_url)')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const sendMessage = async (chatId: string, senderId: string, content: string, mediaUrl?: string, mediaType?: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content,
      media_url: mediaUrl,
      media_type: mediaType
    })
    .select();
  
  if (error) throw error;
  return data;
};

export const getWallet = async (userId: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getTransactions = async (walletId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};