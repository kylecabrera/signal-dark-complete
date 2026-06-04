import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket]       = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = import.meta.env.VITE_SERVER_URL || '';
    console.log('Connecting socket to:', url || 'same origin');

    const s = io(url, {
      autoConnect: false,
      withCredentials: true,
    });

    s.on('connect',       () => { console.log('Socket connected:', s.id); setConnected(true); });
    s.on('disconnect', reason => { console.log('Socket disconnected:', reason); setConnected(false); });
    s.on('connect_error',  err => { console.error('Socket connection error:', err.message); });

    setSocket(s);
    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() { return useContext(SocketContext); }