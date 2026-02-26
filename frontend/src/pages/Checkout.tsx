import { useState, useEffect } from 'react';
import { useGetCart } from '../hooks/useCart';
import { useGetAllProducts } from '../hooks/useProducts';
import { useGetCustomerProfile } from '../hooks/useCustomerProfile';
import { useCreateOrder, useMarkOrderAsPaid } from '../hooks/useOrders';
import { useCreateCheckoutSession } from '../hooks/useStripeCheckout';
import { useGetUpiConfig } from '../hooks/useUpiConfig';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate, Link } from '@tanstack/react-router';
import CustomerInfoForm from '../components/CustomerInfoForm';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { Variant_cashOnDelivery_online, ShoppingItem } from '../backend';
import { Button } from '../components/ui/button';
import { Loader2, ArrowLeft, CheckCircle, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { identity } = useInternetIdentity();
  const { data: cartItems } = useGetCart();
  const { data: products } = useGetAllProducts();
  const { data: customerProfile } = useGetCustomerProfile();
  const { data: upiConfig, isLoading: upiConfigLoading } = useGetUpiConfig();
  const createOrder = useCreateOrder();
  const markOrderAsPaid = useMarkOrderAsPaid();
  const createCheckoutSession = useCreateCheckoutSession();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string; address: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | null>(null);
  const [showUpiInstructions, setShowUpiInstructions] = useState(false);
  const [upiIdCopied, setUpiIdCopied] = useState(false);

  useEffect(() => {
    if (customerProfile) {
      setCustomerInfo({
        name: customerProfile.name,
        phone: customerProfile.phone,
        address: customerProfile.address,
      });
    }
  }, [customerProfile]);

  const handleCopyUpiId = async (upiId: string) => {
    try {
      await navigator.clipboard.writeText(upiId);
      setUpiIdCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setUpiIdCopied(false), 2000);
    } catch {
      toast.error('Failed to copy UPI ID');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground mb-6">You need to login to checkout</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Add items to your cart before checkout</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const grandTotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const handlePlaceOrder = async () => {
    if (!customerInfo) {
      toast.error('Please complete your delivery information');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      if (paymentMethod === 'card') {
        // Stripe checkout flow
        const stripeItems: ShoppingItem[] = cartItems.map((item) => {
          const product = products?.find((p) => p.id === item.productId);
          return {
            productName: product?.name || 'Product',
            productDescription: product?.description || '',
            priceInCents: BigInt(Number(item.totalPrice) * 100),
            quantity: item.quantity,
            currency: 'inr',
          };
        });

        const session = await createCheckoutSession.mutateAsync(stripeItems);
        if (!session?.url) {
          throw new Error('Stripe session missing url');
        }

        // Create order with online payment method before redirecting
        await createOrder.mutateAsync({
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          paymentMethod: Variant_cashOnDelivery_online.online,
        });

        window.location.href = session.url;
      } else if (paymentMethod === 'upi') {
        setShowUpiInstructions(true);
      } else {
        // Cash on Delivery
        const orderId = await createOrder.mutateAsync({
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          paymentMethod: Variant_cashOnDelivery_online.cashOnDelivery,
        });
        toast.success('Order placed successfully!');
        navigate({ to: `/order-confirmation/${orderId}` });
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handleUpiConfirm = async () => {
    if (!customerInfo) return;

    try {
      // Create the order
      const orderId = await createOrder.mutateAsync({
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        paymentMethod: Variant_cashOnDelivery_online.online,
      });

      // Automatically mark payment as paid after UPI confirmation
      try {
        await markOrderAsPaid.mutateAsync(orderId);
      } catch (payErr) {
        console.error('Failed to mark order as paid:', payErr);
        // Don't block navigation even if this fails
      }

      toast.success('Payment confirmed! Order placed successfully.');
      navigate({ to: `/order-confirmation/${orderId}` });
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const isUpiProcessing = createOrder.isPending || markOrderAsPaid.isPending;

  if (showUpiInstructions) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-8">
            <div className="text-center mb-6">
              <CheckCircle className="h-14 w-14 text-green-600 mx-auto mb-3" />
              <h2 className="text-2xl font-display font-bold">UPI Payment Instructions</h2>
              <p className="text-muted-foreground mt-1">Complete your payment using any UPI app</p>
            </div>

            {upiConfigLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : upiConfig ? (
              <div className="space-y-5 mb-6">
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Scan QR Code to Pay
                  </p>
                  <div className="border-2 border-primary/20 rounded-xl p-3 bg-white inline-block shadow-sm">
                    <img
                      src={upiConfig.qrCode.getDirectURL()}
                      alt="UPI QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Or Pay using UPI ID
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-base font-semibold bg-background border border-border rounded px-3 py-2 select-all">
                      {upiConfig.upiId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUpiId(upiConfig.upiId)}
                      className="flex-shrink-0"
                    >
                      {upiIdCopied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                  <p className="text-3xl font-display font-bold text-primary">₹{grandTotal}</p>
                </div>

                {/* Steps */}
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground bg-muted/20 rounded-lg p-4">
                  <li>Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                  <li>Scan the QR code above or enter the UPI ID</li>
                  <li>Enter amount: ₹{grandTotal}</li>
                  <li>Complete the payment</li>
                  <li>Click <strong>"Confirm Payment Done"</strong> below</li>
                </ol>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">UPI payment details not yet configured</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Please contact support or choose another payment method.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowUpiInstructions(false)}
                className="flex-1"
                disabled={isUpiProcessing}
              >
                Go Back
              </Button>
              <Button onClick={handleUpiConfirm} disabled={isUpiProcessing} className="flex-1">
                {isUpiProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Payment Done'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/cart" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="text-4xl font-display font-bold text-primary mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CustomerInfoForm onProfileComplete={setCustomerInfo} />
          <PaymentMethodSelector onSelect={setPaymentMethod} selectedMethod={paymentMethod} />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 sticky top-20">
            <h3 className="font-display font-bold text-xl mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {cartItems.map((item, idx) => {
                const product = products?.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="flex-1">
                      {product?.name || 'Product'} x {item.quantity.toString()}
                    </span>
                    <span className="font-semibold">₹{Number(item.totalPrice)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={!customerInfo || !paymentMethod || createOrder.isPending || createCheckoutSession.isPending}
              className="w-full"
              size="lg"
            >
              {createOrder.isPending || createCheckoutSession.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
