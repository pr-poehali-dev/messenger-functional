import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateChat: (name: string, type: 'personal' | 'group') => void;
}

export default function NewChatDialog({ open, onClose, onCreateChat }: NewChatDialogProps) {
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState<'personal' | 'group'>('personal');

  const handleCreate = () => {
    if (chatName.trim()) {
      onCreateChat(chatName, chatType);
      setChatName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Icon name="Plus" size={20} className="text-white" />
            </div>
            Новый чат
          </DialogTitle>
          <DialogDescription>
            Создайте личный диалог или групповой чат
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="chat-name">Название чата</Label>
            <Input
              id="chat-name"
              placeholder="Введите название..."
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Тип чата</Label>
            <RadioGroup value={chatType} onValueChange={(value) => setChatType(value as 'personal' | 'group')}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Icon name="User" size={18} className="text-primary" />
                  <div>
                    <div className="font-semibold">Личный чат</div>
                    <div className="text-xs text-muted-foreground">Переписка один на один</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="group" id="group" />
                <Label htmlFor="group" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Icon name="Users" size={18} className="text-secondary" />
                  <div>
                    <div className="font-semibold">Группа</div>
                    <div className="text-xs text-muted-foreground">Общение нескольких человек</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!chatName.trim()}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            Создать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
