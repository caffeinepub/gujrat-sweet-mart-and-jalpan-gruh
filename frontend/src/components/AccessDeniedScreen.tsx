import { ShieldAlert } from 'lucide-react';

interface AccessDeniedScreenProps {
  message?: string;
}

export default function AccessDeniedScreen({ message }: AccessDeniedScreenProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          {message || 'You do not have permission to access this page. Admin access is required.'}
        </p>
      </div>
    </div>
  );
}

