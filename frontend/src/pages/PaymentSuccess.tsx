import { useEffect, useState } from 'react';
import { useActor } from '../hooks/useActor';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { CheckCircle, Home, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const { actor } = useActor();
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, [actor]);

  const verifyPayment = async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId || !actor) {
      setIsVerifying(false);
      return;
    }

    try {
      const status = await actor.getStripeSessionStatus(sessionId);
      setSessionStatus(status);
    } catch (error) {
      console.error('Failed to verify payment:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
        <h1 className="text-4xl font-display font-bold text-primary mb-4">Payment Successful!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your payment has been processed successfully. Your order has been placed and will be delivered soon.
        </p>
        <div className="bg-card border-2 border-green-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-muted-foreground">
            You will receive a confirmation shortly. Thank you for shopping with us!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Track your order in <strong>My Orders</strong> to see delivery updates.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button variant="outline" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link to="/my-orders">
            <Button size="lg">View My Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
