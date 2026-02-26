import { useGetOrders } from '../hooks/useOrders';
import { useGetAllProducts } from '../hooks/useProducts';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { TimeUnit } from '../backend';
import { Link, useParams } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { CheckCircle, Clock, Home, Package, Loader2 } from 'lucide-react';

function formatDeliveryTime(value: bigint, unit: TimeUnit): string {
  const num = Number(value);
  switch (unit) {
    case TimeUnit.minutes:
      return `${num} ${num === 1 ? 'minute' : 'minutes'}`;
    case TimeUnit.hours:
      return `${num} ${num === 1 ? 'hour' : 'hours'}`;
    case TimeUnit.days:
      return `${num} ${num === 1 ? 'day' : 'days'}`;
    default:
      return `${num} ${unit}`;
  }
}

export default function OrderConfirmation() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useGetOrders();
  const { data: products } = useGetAllProducts();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground mb-6">You need to login to view order details</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const order = orders?.find((o) => o.orderId.toString() === orderId);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-4">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find this order</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">Thank you for your order</p>
        </div>

        <div className="bg-card border-2 border-primary/20 rounded-lg p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold mb-2">Order #{order.orderId.toString()}</h2>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Name:</span> {order.name}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {order.phone}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {order.address}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <p className="text-sm">
                {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
              {order.deliveryTime && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>Estimated Delivery:</strong>{' '}
                    {formatDeliveryTime(order.deliveryTime.value, order.deliveryTime.unit)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const product = products?.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="flex justify-between bg-muted/30 p-3 rounded">
                    <span>
                      {product?.name || 'Unknown Product'} x {item.quantity.toString()}
                    </span>
                    <span className="font-semibold">₹{Number(item.totalPrice)}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
              <span>Total:</span>
              <span>₹{order.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button variant="outline" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link to="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
