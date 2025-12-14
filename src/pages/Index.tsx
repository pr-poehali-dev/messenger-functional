import { useState, useEffect } from 'react';
import AuthScreen from '@/components/AuthScreen';
import ContactsList from '@/components/ContactsList';
import AddContactDialog from '@/components/AddContactDialog';
import CallWindow from '@/components/CallWindow';
import { 
  loginUser, 
  getContacts, 
  searchUsers, 
  addContact, 
  startCall as apiStartCall,
  endCall as apiEndCall,
  type User, 
  type Contact 
} from '@/lib/api';
import { WebRTCCall } from '@/lib/webrtc';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<{
    contactId: number;
    contactName: string;
    type: 'audio' | 'video';
    callId?: number;
  } | null>(null);
  const [webrtcCall, setWebrtcCall] = useState<WebRTCCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      const contactsList = await getContacts(user.id);
      setContacts(contactsList);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить контакты',
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

  const handleSearchUsers = async (query: string): Promise<Contact[]> => {
    try {
      return await searchUsers(query);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось найти пользователей',
        variant: 'destructive',
      });
      return [];
    }
  };

  const handleAddContact = async (contactId: number) => {
    if (!user) return;
    
    try {
      await addContact(user.id, contactId);
      await loadContacts();
      toast({
        title: 'Контакт добавлен',
        description: 'Пользователь добавлен в ваши контакты',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить контакт',
        variant: 'destructive',
      });
    }
  };

  const handleStartCall = async (contactId: number, type: 'audio' | 'video') => {
    if (!user) return;

    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    try {
      const callData = await apiStartCall(user.id, contactId, type);
      
      const call = new WebRTCCall();
      const stream = await call.startCall(type === 'video');
      
      setWebrtcCall(call);
      setLocalStream(stream);
      setActiveCall({
        contactId,
        contactName: contact.username,
        type,
        callId: callData.call_id,
      });

      call.onRemoteStream((remoteStream) => {
        setRemoteStream(remoteStream);
      });

      call.onCallEnd(() => {
        handleEndCall();
      });

      toast({
        title: 'Звонок начат',
        description: `Звоним ${contact.username}...`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось начать звонок',
        variant: 'destructive',
      });
    }
  };

  const handleEndCall = async () => {
    if (activeCall?.callId) {
      try {
        await apiEndCall(activeCall.callId);
      } catch (error) {
        console.error('Failed to end call on server:', error);
      }
    }

    if (webrtcCall) {
      webrtcCall.endCall();
      setWebrtcCall(null);
    }

    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIsAudioEnabled(true);
    setIsVideoEnabled(true);
  };

  const handleToggleAudio = () => {
    if (webrtcCall) {
      const newState = !isAudioEnabled;
      webrtcCall.toggleAudio(newState);
      setIsAudioEnabled(newState);
    }
  };

  const handleToggleVideo = () => {
    if (webrtcCall) {
      const newState = !isVideoEnabled;
      webrtcCall.toggleVideo(newState);
      setIsVideoEnabled(newState);
    }
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="h-screen flex overflow-hidden">
        <div className="w-full md:w-96 flex-shrink-0">
          <ContactsList
            contacts={contacts}
            onCall={handleStartCall}
            onAddContact={() => setAddContactOpen(true)}
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 bg-gradient-to-br from-primary to-secondary p-6 rounded-full inline-block">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Выберите контакт</h2>
            <p className="text-muted-foreground">Позвоните друзьям или добавьте новые контакты</p>
          </div>
        </div>
      </div>

      <AddContactDialog
        open={addContactOpen}
        onClose={() => setAddContactOpen(false)}
        onSearch={handleSearchUsers}
        onAdd={handleAddContact}
      />

      {activeCall && (
        <CallWindow
          contactName={activeCall.contactName}
          callType={activeCall.type}
          onDecline={handleEndCall}
          localStream={localStream}
          remoteStream={remoteStream}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
        />
      )}
    </>
  );
};

export default Index;
