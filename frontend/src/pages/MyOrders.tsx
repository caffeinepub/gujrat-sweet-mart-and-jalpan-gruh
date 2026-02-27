import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetOrders, useCancelOrder } from '../hooks/useOrders';
import { useGetAllProducts } from '../hooks/useProducts';
import { OrderStatus, TimeUnit } from '../backend';
import OrderTrackingTimeline from '../components/OrderTrackingTimeline';
import BackButton from '../components/BackButton';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Clock, Loader2, Package, ShoppingBag, XCircle } from 'lucide-react';
import { toast } from 'sonner';

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

export default function MyOrders() {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useGetOrders();
  const { data: products } = useGetAllProducts();
  const cancelOrder = useCancelOrder();

  const [cancelConfirmOrderId, setCancelConfirmOrderId] = useState<bigint | null>(null);

  const handleCancelConfirm = async () => {
    if (cancelConfirmOrderId === null) return;
    try {
      await cancelOrder.mutateAsync(cancelConfirmOrderId);
      toast.success('Order cancelled successfully');
      setCancelConfirmOrderId(null);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order. Please try again.');
      setCancelConfirmOrderId(null);
    }
  };

  const canCancelOrder = (status: OrderStatus) => {
    return status === OrderStatus.orderPlaced || status === OrderStatus.shipped;
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.orderPlaced:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case OrderStatus.shipped:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case OrderStatus.outForDelivery:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case OrderStatus.delivered:
        return 'bg-green-100 text-green-800 border-green-300';
      case OrderStatus.cancelled:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.orderPlaced:
        return 'Order Placed';
      case OrderStatus.shipped:
        return 'Shipped';
      case OrderStatus.outForDelivery:
        return 'Out for Delivery';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground mb-6">You need to login to view your orders</p>
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

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-4">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet. Start shopping!</p>
          <Link to="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-4xl font-display font-bold text-primary mb-8">My Orders</h1>

      <div className="space-y-8">
        {sortedOrders.map((order) => {
          const orderTotal = order.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

          return (
            <div
              key={order.orderId.toString()}
              className="bg-card border-2 border-primary/20 rounded-lg overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-primary/5 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-primary/10">
                <div>
                  <h3 className="font-display font-bold text-lg">
                    Order #{order.orderId.toString()}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="font-bold text-lg text-primary">₹{orderTotal}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Tracking Timeline */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                    Order Tracking
                  </h4>
                  <OrderTrackingTimeline status={order.status} />
                </div>

                {/* Delivery Time (only if set by admin) */}
                {order.deliveryTime && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Estimated Delivery Time:</span>{' '}
                      {formatDeliveryTime(order.deliveryTime.value, order.deliveryTime.unit)}
                    </p>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Items Ordered
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => {
                      const product = products?.find((p) => p.id === item.productId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-muted/30 px-4 py-2 rounded-md text-sm"
                        >
                          <div className="flex items-center gap-3">
                            {product?.photoUrl && (
                              <img
                                src={product.photoUrl}
                                alt={product.name}
                                className="h-10 w-10 object-contain rounded"
                              />
                            )}
                            <span>
                              {product?.name || 'Unknown Product'}{' '}
                              <span className="text-muted-foreground">× {item.quantity.toString()}</span>
                            </span>
                          </div>
                          <span className="font-semibold">₹{Number(item.totalPrice)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t">
                    <span>Order Total</span>
                    <span className="text-primary">₹{orderTotal}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                    Delivery Address
                  </h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><span className="font-medium text-foreground">{order.name}</span></p>
                    <p>{order.phone}</p>
                    <p>{order.address}</p>
                  </div>
                </div>

                {/* Cancel Button */}
                {canCancelOrder(order.status) && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setCancelConfirmOrderId(order.orderId)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={cancelConfirmOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelConfirmOrderId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Cancel Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
