import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface CallWindowProps {
  contactName: string;
  callType: 'audio' | 'video';
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline: () => void;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
}

export default function CallWindow({
  contactName,
  callType,
  isIncoming = false,
  onAccept,
  onDecline,
  localStream,
  remoteStream,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled = true,
  isVideoEnabled = true,
}: CallWindowProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      setIsConnected(true);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
      <div className="w-full h-full relative">
        {callType === 'video' && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Avatar className="h-32 w-32 mb-6">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-4xl">
                {contactName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-3xl font-bold mb-2">{contactName}</h2>
            <p className="text-lg text-muted-foreground mb-4">
              {isIncoming ? 'Входящий звонок...' : isConnected ? formatDuration(callDuration) : 'Вызов...'}
            </p>
            {isConnected && (
              <div className="flex gap-2 items-center animate-pulse">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-500">Соединение установлено</span>
              </div>
            )}
          </div>
        )}

        {callType === 'video' && localStream && (
          <div className="absolute top-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          {isIncoming ? (
            <>
              <Button
                size="lg"
                onClick={onAccept}
                className="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
              >
                <Icon name="Phone" size={28} />
              </Button>
              <Button
                size="lg"
                onClick={onDecline}
                className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
              >
                <Icon name="PhoneOff" size={28} />
              </Button>
            </>
          ) : (
            <>
              {callType === 'video' && onToggleVideo && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={onToggleVideo}
                  className={`h-14 w-14 rounded-full ${!isVideoEnabled ? 'bg-red-500/20' : ''}`}
                >
                  <Icon name={isVideoEnabled ? 'Video' : 'VideoOff'} size={24} />
                </Button>
              )}
              
              {onToggleAudio && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={onToggleAudio}
                  className={`h-14 w-14 rounded-full ${!isAudioEnabled ? 'bg-red-500/20' : ''}`}
                >
                  <Icon name={isAudioEnabled ? 'Mic' : 'MicOff'} size={24} />
                </Button>
              )}
              
              <Button
                size="lg"
                onClick={onDecline}
                className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
              >
                <Icon name="PhoneOff" size={28} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
