import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatList({ chats, activeChat, onChatSelect, onNewChat }: ChatListProps) {
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Messenger
          </h1>
          <Button
            onClick={onNewChat}
            size="icon"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            <Icon name="Plus" size={20} />
          </Button>
        </div>
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск чатов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full p-3 rounded-xl mb-2 flex items-center gap-3 transition-all hover:bg-sidebar-accent ${
                activeChat === chat.id ? 'bg-sidebar-accent' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                    {chat.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-sidebar rounded-full" />
                )}
              </div>
              
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground ml-2">{chat.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>

              {chat.unread > 0 && (
                <div className="flex-shrink-0 h-6 min-w-[24px] px-2 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{chat.unread}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
