import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Send, 
  Search, 
  Plus, 
  MessageCircle, 
  Users, 
  Hash,
  Paperclip,
  Smile,
  Phone,
  Video,
  AtSign
} from 'lucide-react';
import { mockUsers, mockMessages } from '../data/mockData';
import { Message, User } from '../types';

const Communication: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedChat, setSelectedChat] = useState<string>('community');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivateMessageOpen, setIsPrivateMessageOpen] = useState(false);
  const [privateMessageRecipient, setPrivateMessageRecipient] = useState('');
  const [privateMessageContent, setPrivateMessageContent] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user!.id,
        receiverId: selectedChat === 'community' ? undefined : selectedChat,
        groupId: selectedChat === 'community' ? 'community' : undefined,
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        mentions: extractMentions(newMessage),
        reactions: [],
        seen: false,
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleSendPrivateMessage = () => {
    if (privateMessageContent.trim() && privateMessageRecipient) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user!.id,
        receiverId: privateMessageRecipient,
        content: privateMessageContent,
        timestamp: new Date().toISOString(),
        type: 'text',
        mentions: [],
        reactions: [],
        seen: false,
      };
      setMessages([...messages, message]);
      setPrivateMessageContent('');
      setPrivateMessageRecipient('');
      setIsPrivateMessageOpen(false);
      
      // Switch to the private chat
      setSelectedChat(privateMessageRecipient);
    }
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const getConversations = () => {
    const conversations: { [key: string]: { user: User; lastMessage?: Message } } = {};
    
    // Get all users except current user
    mockUsers.filter(u => u.id !== user?.id).forEach(u => {
      conversations[u.id] = { user: u };
    });
    
    // Add last message for each conversation
    messages.forEach(msg => {
      if (msg.groupId) return; // Skip group messages for private conversations
      
      const otherUserId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
      if (otherUserId && conversations[otherUserId]) {
        if (!conversations[otherUserId].lastMessage || 
            new Date(msg.timestamp) > new Date(conversations[otherUserId].lastMessage!.timestamp)) {
          conversations[otherUserId].lastMessage = msg;
        }
      }
    });
    
    return Object.values(conversations);
  };

  const getChatMessages = (chatId: string) => {
    if (chatId === 'community') {
      return messages.filter(msg => msg.groupId === 'community')
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    
    return messages.filter(msg => 
      !msg.groupId && (
        (msg.senderId === user?.id && msg.receiverId === chatId) ||
        (msg.senderId === chatId && msg.receiverId === user?.id)
      )
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const selectedUser = selectedChat === 'community' ? null : mockUsers.find(u => u.id === selectedChat);
  const chatMessages = getChatMessages(selectedChat);
  const conversations = getConversations();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMessageContent = (content: string, mentions: string[]) => {
    if (mentions.length === 0) return content;
    
    let renderedContent = content;
    mentions.forEach(mention => {
      renderedContent = renderedContent.replace(
        new RegExp(`@${mention}`, 'g'),
        `<span class="bg-blue-100 text-blue-800 px-1 rounded">@${mention}</span>`
      );
    });
    
    return <span dangerouslySetInnerHTML={{ __html: renderedContent }} />;
  };

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg border">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Messages</h3>
            <Dialog open={isPrivateMessageOpen} onOpenChange={setIsPrivateMessageOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Private Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select value={privateMessageRecipient} onValueChange={setPrivateMessageRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.filter(u => u.id !== user?.id).map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Input
                      id="message"
                      placeholder="Type your private message..."
                      value={privateMessageContent}
                      onChange={(e) => setPrivateMessageContent(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendPrivateMessage} className="w-full">
                    Send Private Message
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Community Chat */}
        <div className="p-4 space-y-2">
          <Button 
            variant={selectedChat === 'community' ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            size="sm"
            onClick={() => setSelectedChat('community')}
          >
            <Hash className="w-4 h-4 mr-2" />
            Community Chat
            <Badge variant="secondary" className="ml-auto">
              {messages.filter(m => m.groupId === 'community').length}
            </Badge>
          </Button>
        </div>

        <Separator />

        {/* Private Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
              DIRECT MESSAGES
            </div>
            {conversations.map(({ user: chatUser, lastMessage }) => (
              <div
                key={chatUser.id}
                onClick={() => setSelectedChat(chatUser.id)}
                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat === chatUser.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {chatUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{chatUser.name}</p>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(chatUser.role)} variant="secondary">
                        {chatUser.role}
                      </Badge>
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {lastMessage.senderId === user?.id ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedChat === 'community' ? (
              <>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Hash className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Community Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    {mockUsers.length} members • General discussion
                  </p>
                </div>
              </>
            ) : selectedUser ? (
              <>
                <Avatar>
                  <AvatarFallback>
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedUser.designation} • {selectedUser.role}
                  </p>
                </div>
              </>
            ) : null}
          </div>
          {selectedUser && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((message) => {
              const isOwn = message.senderId === user?.id;
              const sender = mockUsers.find(u => u.id === message.senderId);
              
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && selectedChat === 'community' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {sender?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{sender?.name}</span>
                        <Badge className={getRoleColor(sender?.role || '')} variant="secondary">
                          {sender?.role}
                        </Badge>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm">
                        {renderMessageContent(message.content, message.mentions)}
                      </div>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder={
                  selectedChat === 'community' 
                    ? "Type a message... Use @username to mention someone" 
                    : "Type a message..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <AtSign className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Smile className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {selectedChat === 'community' && (
            <div className="mt-2 text-xs text-muted-foreground">
              💡 Tip: Use @username to mention someone (e.g., @admin, @sarah, @mike)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communication;