
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getChats, getMessages, sendMessage, getProfile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Plus, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon,
  Paperclip,
  Smile,
  Mic,
  Clock,
  CheckCheck,
  Check,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [showMobileChats, setShowMobileChats] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (id && chats.length > 0) {
      const chat = chats.find(c => c.id === id);
      if (chat) {
        setActiveChat(chat);
        fetchMessages(chat.id);
        setShowMobileChats(false);
      }
    }
  }, [id, chats]);

  const fetchChats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getChats(user.id);
      setChats(data);
      
      // If no chat is selected and we have chats, select the first one
      if (!activeChat && data.length > 0 && !id) {
        setActiveChat(data[0]);
        fetchMessages(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const data = await getMessages(chatId);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!user || !activeChat || !messageText.trim()) return;
    
    try {
      setSendingMessage(true);
      await sendMessage(activeChat.id, user.id, messageText);
      setMessageText('');
      
      // Refresh messages
      fetchMessages(activeChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSearchUser = async () => {
    if (!newChatUsername.trim()) return;
    
    try {
      setSearchingUser(true);
      
      // In a real app, you would search for users by username
      // For now, we'll just simulate finding a user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'mock-user-id',
        username: newChatUsername,
        avatar_url: null
      };
      
      setFoundUser(mockUser);
    } catch (error) {
      console.error('Error searching for user:', error);
      toast.error('User not found');
      setFoundUser(null);
    } finally {
      setSearchingUser(false);
    }
  };

  const handleCreateChat = async () => {
    if (!user || !foundUser) return;
    
    try {
      // In a real app, you would create a new chat with the found user
      // For now, we'll just simulate creating a chat
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newChat = {
        id: `chat-${Date.now()}`,
        is_group: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
        participants: [
          {
            user_id: user.id,
            username: profile?.username,
            avatar_url: profile?.avatar_url
          },
          {
            user_id: foundUser.id,
            username: foundUser.username,
            avatar_url: foundUser.avatar_url
          }
        ]
      };
      
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      setMessages([]);
      setShowNewChatDialog(false);
      setNewChatUsername('');
      setFoundUser(null);
      setShowMobileChats(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChatName = (chat: any) => {
    if (chat.is_group) {
      return chat.group_name;
    }
    
    // For 1-on-1 chats, show the other person's name
    const otherParticipant = chat.participants?.find((p: any) => p.user_id !== user?.id);
    return otherParticipant?.username || 'Unknown User';
  };

  const getChatAvatar = (chat: any) => {
    if (chat.is_group) {
      return chat.group_avatar_url;
    }
    
    // For 1-on-1 chats, show the other person's avatar
    const otherParticipant = chat.participants?.find((p: any) => p.user_id !== user?.id);
    return otherParticipant?.avatar_url;
  };

  const getLastMessage = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = chat.messages[0];
    if (!lastMessage.content) {
      return 'Media message';
    }
    
    return lastMessage.content.length > 30
      ? `${lastMessage.content.substring(0, 30)}...`
      : lastMessage.content;
  };

  const getLastMessageTime = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) {
      return '';
    }
    
    const lastMessage = chat.messages[0];
    return formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true });
  };

  const filteredChats = chats.filter(chat => {
    const chatName = getChatName(chat);
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-10rem)]">
      <div className="flex h-full rounded-lg border overflow-hidden">
        {/* Chat List */}
        <div className={`w-full md:w-80 border-r ${showMobileChats ? 'block' : 'hidden md:block'}`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Messages</h2>
              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Chat</DialogTitle>
                    <DialogDescription>
                      Start a conversation with another user.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Enter username"
                        value={newChatUsername}
                        onChange={(e) => setNewChatUsername(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleSearchUser}
                        disabled={searchingUser || !newChatUsername.trim()}
                      >
                        {searchingUser ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                    
                    {foundUser && (
                      <div className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage src={foundUser.avatar_url || ''} />
                            <AvatarFallback>{foundUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{foundUser.username}</span>
                        </div>
                        <Button size="sm" onClick={handleCreateChat}>
                          Chat
                        </Button>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-5rem)]">
            {loading ? (
              <div className="p-4 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'No chats found' : 'No chats yet'}
              </div>
            ) : (
              filteredChats.map(chat => (
                <div
                  key={chat.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer ${activeChat?.id === chat.id ? 'bg-muted' : ''}`}
                  onClick={() => {
                    setActiveChat(chat);
                    fetchMessages(chat.id);
                    setShowMobileChats(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={getChatAvatar(chat) || ''} />
                      <AvatarFallback>{getChatName(chat).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{getChatName(chat)}</h3>
                        <span className="text-xs text-muted-foreground">{getLastMessageTime(chat)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{getLastMessage(chat)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!showMobileChats ? 'block' : 'hidden md:block'}`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    onClick={() => setShowMobileChats(true)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={getChatAvatar(activeChat) || ''} />
                    <AvatarFallback>{getChatName(activeChat).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{getChatName(activeChat)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {activeChat.is_group ? 'Group Chat' : 'Online'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Search in Conversation</DropdownMenuItem>
                      <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  messages.map(message => {
                    const isSender = message.sender_id === user?.id;
                    
                    return (
                      <div key={message.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex items-end space-x-2">
                          {!isSender && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.profiles?.avatar_url || ''} />
                              <AvatarFallback>
                                {message.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-md ${isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                            {message.content && <p>{message.content}</p>}
                            {message.media_url && (
                              <div className="mt-2">
                                {message.media_type?.startsWith('image') ? (
                                  <img 
                                    src={message.media_url} 
                                    alt="Media" 
                                    className="rounded-md max-h-60 object-contain"
                                  />
                                ) : (
                                  <div className="bg-background/50 p-2 rounded-md flex items-center space-x-2">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="text-sm">Media attachment</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-end mt-1 space-x-1">
                              <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                              {isSender && (
                                message.is_read ? (
                                  <CheckCheck className="h-3 w-3 opacity-70" />
                                ) : (
                                  <Check className="h-3 w-3 opacity-70" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button variant="ghost" size="icon">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <h3 className="text-lg font-medium">Select a chat to start messaging</h3>
                <p className="text-muted-foreground mt-2">
                  Choose an existing conversation or start a new one
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setShowNewChatDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;