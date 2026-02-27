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
import BackButton from '../components/BackButton';
import { Variant_cashOnDelivery_online, ShoppingItem } from '../backend';
import { Button } from '../components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
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
        // Stripe card payment
        if (!products) {
          toast.error('Products not loaded. Please try again.');
          return;
        }

        const orderId = await createOrder.mutateAsync({
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          paymentMethod: Variant_cashOnDelivery_online.online,
        });

        const shoppingItems: ShoppingItem[] = cartItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productName: product?.name || 'Product',
            productDescription: product?.description || '',
            quantity: item.quantity,
            priceInCents: BigInt(Math.round(Number(item.totalPrice) / Number(item.quantity) * 100)),
            currency: 'inr',
          };
        });

        const session = await createCheckoutSession.mutateAsync(shoppingItems);
        if (!session?.url) throw new Error('Stripe session missing url');
        window.location.href = session.url;
        return;
      }

      if (paymentMethod === 'upi') {
        const orderId = await createOrder.mutateAsync({
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          paymentMethod: Variant_cashOnDelivery_online.online,
        });
        navigate({ to: '/order-confirmation/$orderId', params: { orderId: orderId.toString() } });
        return;
      }

      // Cash on delivery
      const orderId = await createOrder.mutateAsync({
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        paymentMethod: Variant_cashOnDelivery_online.cashOnDelivery,
      });

      navigate({ to: '/order-confirmation/$orderId', params: { orderId: orderId.toString() } });
    } catch (error: any) {
      console.error('Order placement failed:', error);
      toast.error(error?.message || 'Failed to place order. Please try again.');
    }
  };

  const isPlacingOrder = createOrder.isPending || createCheckoutSession.isPending;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-4xl font-display font-bold text-primary mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">Delivery Information</h2>
            <CustomerInfoForm onProfileComplete={setCustomerInfo} />
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">Payment Method</h2>
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 sticky top-20">
            <h3 className="font-display font-bold text-xl mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cartItems.map((item, idx) => {
                const product = products?.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {product?.name || 'Product'} × {item.quantity.toString()}
                    </span>
                    <span>₹{Number(item.totalPrice)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Free delivery included</p>
            </div>

            <Button
              onClick={handlePlaceOrder}
              className="w-full"
              size="lg"
              disabled={isPlacingOrder || !customerInfo || !paymentMethod}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === 'card' ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Pay with Card
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Place Order
                </>
              )}
            </Button>

            {!customerInfo && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Please fill in your delivery information
              </p>
            )}
            {customerInfo && !paymentMethod && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Please select a payment method
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
