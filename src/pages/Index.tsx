import { useState, useEffect } from 'react';
import AuthScreen from '@/components/AuthScreen';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import NewChatDialog from '@/components/NewChatDialog';
import { loginUser, getUserChats, createChat, getChatMessages, sendMessage, type User, type Chat as ApiChat, type Message as ApiMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat && user) {
      loadMessages(activeChat);
    }
  }, [activeChat]);

  const loadChats = async () => {
    if (!user) return;
    
    try {
      const apiChats = await getUserChats(user.id);
      setChats(apiChats.map(chat => ({
        ...chat,
        messages: []
      })));
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить чаты',
        variant: 'destructive',
      });
    }
  };

  const loadMessages = async (chatId: string) => {
    if (!user) return;
    
    try {
      const apiMessages = await getChatMessages(chatId);
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: apiMessages.map(msg => ({
                  id: msg.id,
                  text: msg.text,
                  time: msg.time,
                  isMine: msg.userId === user.id,
                  status: msg.status,
                }))
              }
            : chat
        )
      );
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive',
      });
    }
  };

  const handleLogin = async (username: string) => {
    try {
      const loggedUser = await loginUser(username);
      setUser(loggedUser);
      toast({
        title: 'Добро пожаловать!',
        description: `Вы вошли как ${loggedUser.username}`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось войти',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeChat || !user) return;

    const tempId = `temp${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
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
              messages: [...chat.messages, tempMessage],
              lastMessage: text,
              time: tempMessage.time,
            }
          : chat
      )
    );

    try {
      const sentMessage = await sendMessage(activeChat, user.id, text);
      
      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === tempId
                    ? { ...msg, id: sentMessage.id }
                    : msg
                ),
              }
            : chat
        )
      );
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  const handleCreateChat = async (name: string, type: 'personal' | 'group') => {
    if (!user) return;

    try {
      const newChat = await createChat(name, user.id, type);
      
      setChats(prev => [{
        id: newChat.id,
        name: newChat.name,
        lastMessage: 'Новый чат',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        online: false,
        messages: [],
      }, ...prev]);
      
      setActiveChat(newChat.id);
      
      toast({
        title: 'Чат создан',
        description: `Чат "${name}" успешно создан`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать чат',
        variant: 'destructive',
      });
    }
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