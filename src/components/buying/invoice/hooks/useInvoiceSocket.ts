import React from 'react';
import useConfig from '@/hooks/content/useConfig';
import useSocket from '@/hooks/useSocket';
import { toast } from 'sonner';
import { SocketRoom } from '@/types/enums/socket-room';
import { Sequential } from '@/types';

const useInvoiceSocket = () => {
  const {
    configs: [sequence],
    isConfigPending: isInvoiceSequencePending
  } = useConfig(['invoice_sequence']);

  const [currentSequence, setCurrentSequence] = React.useState<Sequential | null>(null);
  const hasJoinedRef = React.useRef(false);

  const socket = useSocket('/ws');

  React.useEffect(() => {
    if (sequence?.value) {
      setCurrentSequence(sequence.value);
    }
  }, [sequence]);

  React.useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      if (!hasJoinedRef.current) {
        socket.emit('joinRoom', SocketRoom.INVOICE_SEQUENCE);
        console.log('Joined room: INVOICE_SEQUENCE');
        hasJoinedRef.current = true;
      }
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('invoice-sequence-updated', (data) => {
      setCurrentSequence((prevSequence) =>
        prevSequence ? { ...prevSequence, next: data.value } : { next: data.value }
      );
      toast.info('Le numéro séquentiel a été mis à jour');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Erreur de connexion au serveur');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the WebSocket server');
      hasJoinedRef.current = false;
    });

    return () => {
      if (socket && hasJoinedRef.current) {
        socket.emit('leaveRoom', SocketRoom.INVOICE_SEQUENCE);
        console.log('Left room: INVOICE_SEQUENCE');
        hasJoinedRef.current = false;
      }

      socket.off('connect', handleConnect);
      socket.off('invoice-sequence-updated');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [socket]);

  return {
    currentSequence,
    isInvoiceSequencePending
  };
};

export default useInvoiceSocket;
