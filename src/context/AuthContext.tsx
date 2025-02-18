'use client';

import React, { useEffect } from 'react';

type Props = {
  children: React.ReactNode;
};

type IAuthContext = {
  authenticated: boolean;
  setAuthenticated: (value: boolean) => void;
};

const AuthContext = React.createContext<IAuthContext>({
  authenticated: false,
  setAuthenticated: () => {}
});

const AuthProvider = ({ children }: Props) => {
  const [authenticated, setAuthenticated] = React.useState(false);

  useEffect(() => {
    // Access localStorage only on the client side
    const token = localStorage.getItem('access_token');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
