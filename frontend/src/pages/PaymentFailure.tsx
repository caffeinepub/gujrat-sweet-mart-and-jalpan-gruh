import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function PaymentFailure() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="text-center">
          <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
          <h1 className="text-4xl font-display font-bold text-destructive mb-4">Payment Failed</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your payment was not completed. This could be due to cancellation or a payment processing error.
          </p>
          <div className="bg-card border-2 border-destructive/20 rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-4">
              Don't worry, no charges were made to your account. You can try again or choose a different payment method.
            </p>
            <p className="text-sm font-semibold">
              Need help? Contact us at support@gujaratsweetmart.com
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" size="lg">
                <Home className="mr-2 h-5 w-5" />
                Go Home
              </Button>
            </Link>
            <Link to="/checkout">
              <Button size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
