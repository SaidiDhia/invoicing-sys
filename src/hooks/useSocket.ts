import React from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.BASE_URL;

const useSocket = (path: string) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);

  React.useEffect(() => {
    const newSocket = io(SOCKET_URL || '', {
      path,
      extraHeaders: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket:', path);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      newSocket.disconnect();
      console.log('Disconnected from socket:', path);
    };
  }, [path]);

  return socket;
};

export default useSocket;
