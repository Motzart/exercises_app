import { useSearchParams, Form } from 'react-router';
import { useState } from 'react';
import { supabaseClient } from '~/lib/supabaseClient';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

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
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Login to your account</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full cursor-pointer"
          >
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
