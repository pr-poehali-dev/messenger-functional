import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { Contact } from '@/lib/api';

interface ContactsListProps {
  contacts: Contact[];
  onCall: (contactId: number, type: 'audio' | 'video') => void;
  onAddContact: () => void;
}

export default function ContactsList({ contacts, onCall, onAddContact }: ContactsListProps) {
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Контакты
            </h1>
            <Button
              onClick={onAddContact}
              size="icon"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              <Icon name="UserPlus" size={20} />
            </Button>
          </div>
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск контактов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Users" size={48} className="mx-auto mb-2 opacity-50" />
                <p>Контактов пока нет</p>
                <p className="text-sm mt-1">Добавьте друзей для звонков</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="w-full p-3 rounded-xl mb-2 flex items-center gap-3 transition-all hover:bg-sidebar-accent"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                      {contact.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-sm">{contact.username}</h3>
                    <p className="text-xs text-muted-foreground">Нажмите для звонка</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCall(contact.id, 'audio');
                      }}
                      className="hover:bg-green-500/20"
                    >
                      <Icon name="Phone" size={18} className="text-green-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCall(contact.id, 'video');
                      }}
                      className="hover:bg-blue-500/20"
                    >
                      <Icon name="Video" size={18} className="text-blue-500" />
                    </Button>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                  {selectedContact?.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {selectedContact?.username}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => {
                if (selectedContact) onCall(selectedContact.id, 'audio');
                setSelectedContact(null);
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
            >
              <Icon name="Phone" size={20} className="mr-2" />
              Аудиозвонок
            </Button>
            <Button
              onClick={() => {
                if (selectedContact) onCall(selectedContact.id, 'video');
                setSelectedContact(null);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
            >
              <Icon name="Video" size={20} className="mr-2" />
              Видеозвонок
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
