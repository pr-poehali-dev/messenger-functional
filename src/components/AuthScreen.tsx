import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AuthScreenProps {
  onLogin: (username: string) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/20">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="mb-4 mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Icon name="MessageCircle" size={40} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Messenger
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                placeholder="Введите имя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Придумайте пароль"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              disabled={!username.trim()}
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? (
                  <>
                    Нет аккаунта?{' '}
                    <span className="text-primary font-semibold">Зарегистрироваться</span>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{' '}
                    <span className="text-primary font-semibold">Войти</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
