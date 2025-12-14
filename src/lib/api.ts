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

export interface Contact {
  id: number;
  username: string;
}

export interface Call {
  id: number;
  type: 'audio' | 'video';
  status: string;
  time: string;
  duration: number;
  contactName: string;
  direction: 'incoming' | 'outgoing';
}

export async function searchUsers(query: string): Promise<Contact[]> {
  const response = await fetch(`${API_URL}?action=search_users&query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to search users');
  const data = await response.json();
  return data.users || [];
}

export async function addContact(userId: number, contactUserId: number): Promise<void> {
  const response = await fetch(`${API_URL}?action=add_contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, contact_user_id: contactUserId }),
  });
  
  if (!response.ok) throw new Error('Failed to add contact');
}

export async function getContacts(userId: number): Promise<Contact[]> {
  const response = await fetch(`${API_URL}?action=contacts&user_id=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to get contacts');
  const data = await response.json();
  return data.contacts || [];
}

export async function startCall(callerId: number, receiverId: number, callType: 'audio' | 'video'): Promise<{ call_id: number; status: string }> {
  const response = await fetch(`${API_URL}?action=start_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caller_id: callerId, receiver_id: receiverId, call_type: callType }),
  });
  
  if (!response.ok) throw new Error('Failed to start call');
  return response.json();
}

export async function endCall(callId: number, status: string = 'ended'): Promise<{ duration: number }> {
  const response = await fetch(`${API_URL}?action=end_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ call_id: callId, status }),
  });
  
  if (!response.ok) throw new Error('Failed to end call');
  return response.json();
}

export async function getCallHistory(userId: number): Promise<Call[]> {
  const response = await fetch(`${API_URL}?action=call_history&user_id=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Failed to get call history');
  const data = await response.json();
  return data.calls || [];
}