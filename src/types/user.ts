export interface User {
  uid?: string;
  email: string;
  name: string;
  photoURL?: string;
  role: string;
  socketId?: string;
  status: 'online' | 'away' | 'busy';
}