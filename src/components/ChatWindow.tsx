import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatWindowProps {
  chatId: string | null;
  chatName: string;
  chatAvatar?: string;
  online?: boolean;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function ChatWindow({ chatId, chatName, chatAvatar, online, messages, onSendMessage }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 bg-gradient-to-br from-primary to-secondary p-6 rounded-full inline-block">
            <Icon name="MessageCircle" size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Выберите чат</h2>
          <p className="text-muted-foreground">Начните общение с друзьями и коллегами</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatAvatar} alt={chatName} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
            {chatName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{chatName}</h2>
          <p className="text-xs text-muted-foreground">
            {online ? (
              <span className="text-green-500">онлайн</span>
            ) : (
              'был(а) недавно'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Icon name="Phone" size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="Video" size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="MoreVertical" size={20} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 animate-fade-in ${
                message.isMine ? 'flex-row-reverse' : 'flex-row'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {!message.isMine && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chatAvatar} alt={chatName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                    {chatName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  message.isMine
                    ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-md'
                    : 'bg-card text-card-foreground rounded-bl-md'
                }`}
              >
                <p className="text-sm break-words">{message.text}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  message.isMine ? 'text-white/70' : 'text-muted-foreground'
                }`}>
                  <span>{message.time}</span>
                  {message.isMine && (
                    <Icon
                      name={message.status === 'read' ? 'CheckCheck' : 'Check'}
                      size={14}
                      className={message.status === 'read' ? 'text-accent' : ''}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Icon name="Paperclip" size={20} />
          </Button>
          
          <Input
            placeholder="Введите сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          
          <Button variant="ghost" size="icon">
            <Icon name="Smile" size={20} />
          </Button>
          
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            disabled={!input.trim()}
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
