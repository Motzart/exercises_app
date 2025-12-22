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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
