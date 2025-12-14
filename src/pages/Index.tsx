import { useState } from 'react';
import AuthScreen from '@/components/AuthScreen';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import NewChatDialog from '@/components/NewChatDialog';

interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  messages: Message[];
}

const initialChats: Chat[] = [
  {
    id: '1',
    name: 'Анна Иванова',
    lastMessage: 'Привет! Как дела?',
    time: '14:23',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', text: 'Привет! Как дела?', time: '14:23', isMine: false, status: 'read' },
      { id: 'm2', text: 'Привет! Всё отлично, спасибо! А у тебя?', time: '14:24', isMine: true, status: 'read' },
    ],
  },
  {
    id: '2',
    name: 'Команда проекта',
    lastMessage: 'Встреча в 15:00',
    time: '13:45',
    unread: 0,
    online: false,
    messages: [
      { id: 'm3', text: 'Всем привет!', time: '13:40', isMine: false },
      { id: 'm4', text: 'Встреча в 15:00', time: '13:45', isMine: false },
    ],
  },
  {
    id: '3',
    name: 'Максим Петров',
    lastMessage: 'Отправил файлы',
    time: '12:30',
    unread: 0,
    online: true,
    messages: [
      { id: 'm5', text: 'Отправил файлы', time: '12:30', isMine: false },
      { id: 'm6', text: 'Спасибо, получил!', time: '12:31', isMine: true, status: 'read' },
    ],
  },
];

const Index = () => {
  const [user, setUser] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const handleLogin = (username: string) => {
    setUser(username);
  };

  const handleSendMessage = (text: string) => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      status: 'sent',
    };

    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: text,
              time: newMessage.time,
            }
          : chat
      )
    );

    setTimeout(() => {
      const responses = [
        'Понял, спасибо!',
        'Хорошо, договорились',
        'Отлично!',
        'Без проблем',
        'Окей 👍',
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage: Message = {
        id: `m${Date.now()}`,
        text: response,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
      };

      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: [...chat.messages, responseMessage],
                lastMessage: response,
                time: responseMessage.time,
              }
            : chat
        )
      );
    }, 1000 + Math.random() * 2000);
  };

  const handleCreateChat = (name: string) => {
    const newChat: Chat = {
      id: `c${Date.now()}`,
      name,
      lastMessage: 'Новый чат',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      online: false,
      messages: [],
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const currentChat = chats.find(chat => chat.id === activeChat);

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-full md:w-96 flex-shrink-0">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          onNewChat={() => setNewChatOpen(true)}
        />
      </div>

      <ChatWindow
        chatId={activeChat}
        chatName={currentChat?.name || ''}
        chatAvatar={currentChat?.avatar}
        online={currentChat?.online}
        messages={currentChat?.messages || []}
        onSendMessage={handleSendMessage}
      />

      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
};

export default Index;