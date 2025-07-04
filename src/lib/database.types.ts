
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          is_verified: boolean
          channel_url: string | null
          join_date: string
          total_subscribers: number
          total_views: number
          is_premium: boolean
          premium_since: string | null
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          is_verified?: boolean
          channel_url?: string | null
          join_date?: string
          total_subscribers?: number
          total_views?: number
          is_premium?: boolean
          premium_since?: string | null
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          is_verified?: boolean
          channel_url?: string | null
          join_date?: string
          total_subscribers?: number
          total_views?: number
          is_premium?: boolean
          premium_since?: string | null
        }
      }
      videos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          video_url: string
          duration: number | null
          views: number
          likes: number
          dislikes: number
          created_at: string
          updated_at: string
          published_at: string | null
          is_published: boolean
          is_premium: boolean
          is_short: boolean
          category: string | null
          tags: string[] | null
          language: string | null
          location: string | null
          allow_comments: boolean
          monetization_enabled: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          video_url: string
          duration?: number | null
          views?: number
          likes?: number
          dislikes?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
          is_published?: boolean
          is_premium?: boolean
          is_short?: boolean
          category?: string | null
          tags?: string[] | null
          language?: string | null
          location?: string | null
          allow_comments?: boolean
          monetization_enabled?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          video_url?: string
          duration?: number | null
          views?: number
          likes?: number
          dislikes?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
          is_published?: boolean
          is_premium?: boolean
          is_short?: boolean
          category?: string | null
          tags?: string[] | null
          language?: string | null
          location?: string | null
          allow_comments?: boolean
          monetization_enabled?: boolean
        }
      }
      comments: {
        Row: {
          id: string
          video_id: string
          user_id: string
          parent_id: string | null
          content: string
          likes: number
          dislikes: number
          created_at: string
          updated_at: string
          is_pinned: boolean
        }
        Insert: {
          id?: string
          video_id: string
          user_id: string
          parent_id?: string | null
          content: string
          likes?: number
          dislikes?: number
          created_at?: string
          updated_at?: string
          is_pinned?: boolean
        }
        Update: {
          id?: string
          video_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          likes?: number
          dislikes?: number
          created_at?: string
          updated_at?: string
          is_pinned?: boolean
        }
      }
      subscriptions: {
        Row: {
          id: string
          subscriber_id: string
          channel_id: string
          created_at: string
          notification_level: string
        }
        Insert: {
          id?: string
          subscriber_id: string
          channel_id: string
          created_at?: string
          notification_level?: string
        }
        Update: {
          id?: string
          subscriber_id?: string
          channel_id?: string
          created_at?: string
          notification_level?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          created_at: string
          updated_at: string
          is_public: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
        }
      }
      playlist_videos: {
        Row: {
          id: string
          playlist_id: string
          video_id: string
          position: number
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          video_id: string
          position: number
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          video_id?: string
          position?: number
          added_at?: string
        }
      }
      watch_history: {
        Row: {
          id: string
          user_id: string
          video_id: string
          watched_at: string
          watch_duration: number | null
          completed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          watched_at?: string
          watch_duration?: number | null
          completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          watched_at?: string
          watch_duration?: number | null
          completed?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          sender_id: string | null
          video_id: string | null
          type: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sender_id?: string | null
          video_id?: string | null
          type: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sender_id?: string | null
          video_id?: string | null
          type?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          is_group: boolean
          group_name: string | null
          group_avatar_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          is_group?: boolean
          group_name?: string | null
          group_avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          is_group?: boolean
          group_name?: string | null
          group_avatar_url?: string | null
        }
      }
      chat_participants: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          joined_at: string
          is_admin: boolean
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          joined_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          joined_at?: string
          is_admin?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string | null
          media_url: string | null
          media_type: string | null
          created_at: string
          is_read: boolean
          is_deleted: boolean
          reply_to: string | null
          is_forwarded: boolean
          is_starred: boolean
          disappears_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content?: string | null
          media_url?: string | null
          media_type?: string | null
          created_at?: string
          is_read?: boolean
          is_deleted?: boolean
          reply_to?: string | null
          is_forwarded?: boolean
          is_starred?: boolean
          disappears_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string | null
          media_url?: string | null
          media_type?: string | null
          created_at?: string
          is_read?: boolean
          is_deleted?: boolean
          reply_to?: string | null
          is_forwarded?: boolean
          is_starred?: boolean
          disappears_at?: string | null
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          created_at: string
          updated_at: string
          is_kyc_verified: boolean
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          created_at?: string
          updated_at?: string
          is_kyc_verified?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          created_at?: string
          updated_at?: string
          is_kyc_verified?: boolean
        }
      }
      transactions: {
        Row: {
          id: string
          wallet_id: string
          amount: number
          type: string
          status: string
          created_at: string
          updated_at: string
          reference_id: string | null
          description: string | null
        }
        Insert: {
          id?: string
          wallet_id: string
          amount: number
          type: string
          status: string
          created_at?: string
          updated_at?: string
          reference_id?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          wallet_id?: string
          amount?: number
          type?: string
          status?: string
          created_at?: string
          updated_at?: string
          reference_id?: string | null
          description?: string | null
        }
      }
      advertisements: {
        Row: {
          id: string
          advertiser_id: string
          title: string
          description: string | null
          media_url: string
          target_url: string | null
          ad_type: string
          placement: string | null
          budget: number
          spent: number
          impressions: number
          clicks: number
          start_date: string
          end_date: string | null
          status: string
          target_audience: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          advertiser_id: string
          title: string
          description?: string | null
          media_url: string
          target_url?: string | null
          ad_type: string
          placement?: string | null
          budget: number
          spent?: number
          impressions?: number
          clicks?: number
          start_date: string
          end_date?: string | null
          status?: string
          target_audience?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          advertiser_id?: string
          title?: string
          description?: string | null
          media_url?: string
          target_url?: string | null
          ad_type?: string
          placement?: string | null
          budget?: number
          spent?: number
          impressions?: number
          clicks?: number
          start_date?: string
          end_date?: string | null
          status?: string
          target_audience?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      video_likes: {
        Row: {
          id: string
          video_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_video_view: {
        Args: {
          video_uuid: string
        }
        Returns: void
      }
      toggle_video_like: {
        Args: {
          video_uuid: string
          user_uuid: string
        }
        Returns: string
      }
      toggle_subscription: {
        Args: {
          channel_uuid: string
          subscriber_uuid: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}