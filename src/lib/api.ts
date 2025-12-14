const API_URL = 'https://functions.poehali.dev/b0274278-6df8-4e89-91de-b2db51e08617';

export interface User {
  id: number;
  username: string;
}

export interface Chat {
  id: string;
  name: string;
  type: 'personal' | 'group';
  lastMessage: string;
  time: string;
  unread: number;
}

export interface Message {
  id: string;
  text: string;
  time: string;
  userId: number;
  status?: 'sent' | 'delivered' | 'read';
  username?: string;
}

export async function loginUser(username: string): Promise<User> {
  const response = await fetch(`${API_URL}?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  
  if (!response.ok) throw new Error('Login failed');
  return response.json();
}

export async function registerUser(username: string): Promise<User> {
  const response = await fetch(`${API_URL}?action=register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
}

export async function getUserChats(userId: number): Promise<Chat[]> {
  const response = await fetch(`${API_URL}?action=chats&user_id=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to get chats');
  const data = await response.json();
  return data.chats || [];
}

export async function createChat(name: string, userId: number, type: 'personal' | 'group' = 'personal'): Promise<Chat> {
  const response = await fetch(`${API_URL}?action=create_chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, user_id: userId, type }),
  });
  
  if (!response.ok) throw new Error('Failed to create chat');
  return response.json();
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const response = await fetch(`${API_URL}?action=messages&chat_id=${chatId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to get messages');
  const data = await response.json();
  return data.messages || [];
}

export async function sendMessage(chatId: string, userId: number, text: string): Promise<Message> {
  const response = await fetch(`${API_URL}?action=send_message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, user_id: userId, text }),
  });
  
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}
