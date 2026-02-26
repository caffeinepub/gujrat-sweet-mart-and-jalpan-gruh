import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsDeliveryPerson } from '../hooks/useDeliveryRole';
import { useMyProfile } from '../hooks/useMyProfile';
import { useGetActiveOrdersForDelivery, useUpdateOrderStatusByDelivery } from '../hooks/useDeliveryOrders';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Order, OrderStatus, DeliveryApprovalStatus } from '../backend';
import {
  Loader2,
  Phone,
  MapPin,
  User,
  Package,
  Truck,
  CheckCircle2,
  ClipboardList,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.orderPlaced: return 'Order Placed';
    case OrderStatus.shipped: return 'Shipped';
    case OrderStatus.outForDelivery: return 'Out for Delivery';
    case OrderStatus.delivered: return 'Delivered';
    case OrderStatus.cancelled: return 'Cancelled';
    default: return String(status);
  }
}

function getStatusBadgeVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case OrderStatus.orderPlaced: return 'secondary';
    case OrderStatus.shipped: return 'default';
    case OrderStatus.outForDelivery: return 'default';
    case OrderStatus.delivered: return 'outline';
    case OrderStatus.cancelled: return 'destructive';
    default: return 'secondary';
  }
}

function OrderCard({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatusByDelivery();
  const isDelivered = order.status === OrderStatus.delivered;

  const handleMarkOutForDelivery = () => {
    updateStatus.mutate({ orderId: order.orderId, newStatus: OrderStatus.outForDelivery });
  };

  const handleMarkDelivered = () => {
    updateStatus.mutate({ orderId: order.orderId, newStatus: OrderStatus.delivered });
  };

  const isPending = updateStatus.isPending;

  return (
    <Card className={`border-2 ${isDelivered ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900' : 'border-primary/20'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-display">
            Order #{order.orderId.toString()}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Customer</p>
              <p className="font-semibold">{order.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Phone</p>
              <a
                href={`tel:${order.phone}`}
                className="font-semibold text-primary hover:underline"
              >
                {order.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Delivery Address</p>
            <p className="font-medium">{order.address}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            Items
          </p>
          <div className="bg-muted/40 rounded-md p-3 space-y-1.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Product #{item.productId.toString()} × {item.quantity.toString()}
                </span>
                <span className="font-medium">₹{Number(item.totalPrice)}</span>
              </div>
            ))}
            <div className="border-t pt-1.5 mt-1.5 flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>₹{order.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isDelivered && (
          <div className="flex flex-wrap gap-2 pt-1">
            {order.status !== OrderStatus.outForDelivery && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkOutForDelivery}
                disabled={isPending}
                className="flex items-center gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4" />
                )}
                Mark Out for Delivery
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleMarkDelivered}
              disabled={isPending}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Mark Delivered
            </Button>
          </div>
        )}

        {isDelivered && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Delivery completed
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Delivery() {
  const { identity } = useInternetIdentity();
  const { data: isDeliveryPerson, isLoading: roleLoading } = useIsDeliveryPerson();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: orders, isLoading: ordersLoading, error } = useGetActiveOrdersForDelivery();

  if (!identity) {
    return <AccessDeniedScreen />;
  }

  if (roleLoading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Check delivery approval status from profile
  const approvalStatus = profile?.deliveryApprovalStatus;

  // If not a delivery person at all, show access denied
  if (!isDeliveryPerson) {
    // If they have a profile with pending status, show pending message
    if (approvalStatus === DeliveryApprovalStatus.pending) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Pending Approval</h2>
            <p className="text-muted-foreground mb-4">
              Your account is pending admin approval for delivery access. Please wait while the admin reviews your request.
            </p>
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Awaiting Admin Review
            </Badge>
          </div>
        </div>
      );
    }

    // If rejected, show rejection message
    if (approvalStatus === DeliveryApprovalStatus.rejected) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Access Rejected</h2>
            <p className="text-muted-foreground mb-4">
              Your delivery access request has been rejected. Please contact the admin for more information.
            </p>
            <Badge variant="destructive" className="text-sm px-4 py-1.5">
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Access Denied
            </Badge>
          </div>
        </div>
      );
    }

    // Generic access denied
    return <AccessDeniedScreen />;
  }

  // Even if they have the delivery role, check approval status
  if (approvalStatus && approvalStatus !== DeliveryApprovalStatus.approved) {
    if (approvalStatus === DeliveryApprovalStatus.pending) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">Pending Approval</h2>
            <p className="text-muted-foreground mb-4">
              Your account is pending admin approval for delivery access. Please wait while the admin reviews your request.
            </p>
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Awaiting Admin Review
            </Badge>
          </div>
        </div>
      );
    }
    return <AccessDeniedScreen />;
  }

  const activeOrders = orders?.filter(o =>
    o.status !== OrderStatus.delivered && o.status !== OrderStatus.cancelled
  ) || [];

  const completedOrders = orders?.filter(o => o.status === OrderStatus.delivered) || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Delivery Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your active deliveries</p>
        </div>
      </div>

      {ordersLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          <p>Failed to load orders. Please try again.</p>
        </div>
      ) : (
        <>
          {/* Active Orders */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-display font-bold">Active Orders</h2>
              {activeOrders.length > 0 && (
                <Badge variant="default">{activeOrders.length}</Badge>
              )}
            </div>
            {activeOrders.length === 0 ? (
              <div className="bg-card border-2 border-primary/20 rounded-lg p-8 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active orders at the moment.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeOrders.map((order) => (
                  <OrderCard key={order.orderId.toString()} order={order} />
                ))}
              </div>
            )}
          </section>

          {/* Completed Deliveries */}
          {completedOrders.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-display font-bold">Completed Deliveries</h2>
                <Badge variant="outline">{completedOrders.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {completedOrders.map((order) => (
                  <OrderCard key={order.orderId.toString()} order={order} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
