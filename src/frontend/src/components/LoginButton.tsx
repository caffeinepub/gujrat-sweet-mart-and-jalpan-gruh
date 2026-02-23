import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, LogIn, LogOut } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-6 py-2 rounded-full transition-all font-medium shadow-sm ${
        isAuthenticated
          ? 'bg-muted hover:bg-muted/80 text-foreground'
          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
      } disabled:opacity-50`}
    >
      {disabled ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Logging in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Login
        </>
      )}
    </button>
  );
}

