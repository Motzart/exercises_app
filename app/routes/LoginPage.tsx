import { useSearchParams, Form } from 'react-router';
import { useState } from 'react';
import { supabaseClient } from '~/lib/supabaseClient';

export default function LoginPage() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const redirectTo = params.get('redirectTo') ?? '/';

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    if (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto relative isolate overflow-hidden pt-16">
      <h1>Login</h1>

      <button onClick={handleGoogleLogin} disabled={loading}>
        {loading ? 'Redirecting...' : 'Sign in with Google'}
      </button>
    </main>
  );
}
