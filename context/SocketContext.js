import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Connected to server');
        newSocket.emit('join-user', user.id);
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.success(notification.message, {
          duration: 4000,
          icon: '🔔'
        });
      });

      newSocket.on('new-post', (post) => {
        // Handle new post in real-time
        console.log('New post:', post);
      });

      newSocket.on('new-comment', (comment) => {
        // Handle new comment in real-time
        console.log('New comment:', comment);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const joinCommunity = (communityId) => {
    if (socket) {
      socket.emit('join-community', communityId);
    }
  };

  const value = {
    socket,
    notifications,
    setNotifications,
    joinCommunity
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};