import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import React from 'react';

export default function DisconnectComponent() {
  const authContext = React.useContext(AuthContext);
  const router = useRouter();
  React.useEffect(() => {
    localStorage.removeItem('access_token');
    authContext.setAuthenticated(false);
    router.push('/authentication');
  }, []);
  return <React.Fragment></React.Fragment>;
}
