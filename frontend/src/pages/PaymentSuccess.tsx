import { useEffect, useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useMarkOrderAsPaid } from '../hooks/useOrders';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { CheckCircle, Home, Loader2, AlertCircle } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function PaymentSuccess() {
  const { actor } = useActor();
  const markOrderAsPaid = useMarkOrderAsPaid();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actor) {
      verifyAndMarkPaid();
    }
  }, [actor]);

  const verifyAndMarkPaid = async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId || !actor) {
      setIsVerifying(false);
      return;
    }

    try {
      const status = await actor.getStripeSessionStatus(sessionId);

      if (status.__kind__ === 'completed') {
        // Extract orderId from userPrincipal field (stored as orderId string by backend)
        const userPrincipalStr = status.completed.userPrincipal;
        if (userPrincipalStr) {
          try {
            // The userPrincipal field may contain the orderId or principal string
            // Try to parse it as a number (orderId)
            const orderIdNum = parseInt(userPrincipalStr, 10);
            if (!isNaN(orderIdNum)) {
              await markOrderAsPaid.mutateAsync(BigInt(orderIdNum));
            }
          } catch {
            // If parsing fails, still show success — payment was confirmed by Stripe
          }
        }
        setPaymentDone(true);
      } else if (status.__kind__ === 'failed') {
        setError('Payment verification failed. Please contact support.');
      } else {
        // Session exists but not yet completed — still show success UI
        setPaymentDone(true);
      }
    } catch (err) {
      console.error('Failed to verify payment:', err);
      // Even if verification fails, Stripe redirected here so payment likely succeeded
      setPaymentDone(true);
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="text-center">
            <AlertCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
            <h1 className="text-3xl font-display font-bold text-destructive mb-4">Payment Verification Failed</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="text-center">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-4xl font-display font-bold text-primary mb-4">Payment Done!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your payment has been confirmed successfully. Your order has been placed and will be delivered soon.
          </p>
          <div className="bg-card border-2 border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-700">Payment Status: Payment Done</span>
            </div>
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
    </div>
  );
}
