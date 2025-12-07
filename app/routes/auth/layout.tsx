import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';

export default function ProtectedLayout() {
  const { user, session, isAuthenticating } = useContext(SupabaseAuthContext);
  useEffect(() => {
    if (!user && !isAuthenticating) {
      localStorage.setItem('from', location.href);
      //location.replace("/login");
    }
  }, [user, session, isAuthenticating]);

  return <Outlet />;
}
