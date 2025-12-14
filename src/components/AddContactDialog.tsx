import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { Contact } from '@/lib/api';

interface AddContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<Contact[]>;
  onAdd: (contactId: number) => Promise<void>;
}

export default function AddContactDialog({ open, onClose, onSearch, onAdd }: AddContactDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const results = await onSearch(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (contactId: number) => {
    setAddingId(contactId);
    try {
      await onAdd(contactId);
      setSearchResults(prev => prev.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Add contact failed:', error);
    } finally {
      setAddingId(null);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Icon name="UserPlus" size={20} className="text-white" />
            </div>
            Добавить контакт
          </DialogTitle>
          <DialogDescription>
            Найдите пользователя по логину и добавьте в контакты
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="Введите логин..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Icon name="Search" size={18} />
            </Button>
          </div>

          <ScrollArea className="h-64 border rounded-lg">
            {isSearching ? (
              <div className="flex items-center justify-center h-full">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Icon name="Search" size={48} className="mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'Пользователи не найдены' : 'Начните поиск'}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mb-2"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.username}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAdd(user.id)}
                      disabled={addingId === user.id}
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      {addingId === user.id ? (
                        <Icon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Icon name="UserPlus" size={16} className="mr-1" />
                          Добавить
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
