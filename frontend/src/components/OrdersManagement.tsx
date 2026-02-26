import { useState } from 'react';
import { useGetAllOrders, useUpdateOrderStatus, useSetDeliveryTime } from '../hooks/useOrders';
import { useGetAllProducts } from '../hooks/useProducts';
import { OrderStatus, PaymentStatus, TimeUnit, Variant_cashOnDelivery_online } from '../backend';
import { Loader2, Package, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

function PaymentStatusBadge({
  paymentStatus,
  paymentMethod,
}: {
  paymentStatus: PaymentStatus;
  paymentMethod: Variant_cashOnDelivery_online;
}) {
  if (paymentMethod === Variant_cashOnDelivery_online.cashOnDelivery) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-300">
        COD
      </span>
    );
  }

  switch (paymentStatus) {
    case PaymentStatus.paid:
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-300">
          ✓ Paid
        </span>
      );
    case PaymentStatus.failed:
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-red-100 text-red-800 border-red-300">
          ✗ Failed
        </span>
      );
    case PaymentStatus.refunded:
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-purple-100 text-purple-800 border-purple-300">
          Refunded
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-800 border-yellow-300">
          Unpaid
        </span>
      );
  }
}

function DeliveryTimeInput({ orderId, existingValue, existingUnit }: {
  orderId: bigint;
  existingValue?: bigint;
  existingUnit?: TimeUnit;
}) {
  const [value, setValue] = useState<string>(existingValue ? existingValue.toString() : '');
  const [unit, setUnit] = useState<TimeUnit>(existingUnit ?? TimeUnit.hours);
  const setDeliveryTime = useSetDeliveryTime();

  const handleSet = async () => {
    const numVal = parseInt(value, 10);
    if (isNaN(numVal) || numVal <= 0) {
      toast.error('Please enter a valid delivery time value');
      return;
    }
    try {
      await setDeliveryTime.mutateAsync({ orderId, value: BigInt(numVal), unit });
      toast.success('Delivery time set successfully');
    } catch (error) {
      console.error('Failed to set delivery time:', error);
      toast.error('Failed to set delivery time');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-primary/10">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-primary" />
        <label className="text-sm font-medium">Set Delivery Time (after dispatch):</label>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          type="number"
          min={1}
          placeholder="e.g. 2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28"
        />
        <Select value={unit} onValueChange={(v) => setUnit(v as TimeUnit)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeUnit.minutes}>Minutes</SelectItem>
            <SelectItem value={TimeUnit.hours}>Hours</SelectItem>
            <SelectItem value={TimeUnit.days}>Days</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleSet}
          disabled={setDeliveryTime.isPending}
        >
          {setDeliveryTime.isPending ? (
            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Setting...</>
          ) : (
            'Set Delivery Time'
          )}
        </Button>
        {existingValue && existingUnit && (
          <span className="text-xs text-muted-foreground">
            Current: {existingValue.toString()} {existingUnit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function OrdersManagement() {
  const { data: orders, isLoading } = useGetAllOrders();
  const { data: products } = useGetAllProducts();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: bigint, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, newStatus });
      toast.success('Order status updated');
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
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

  const isDispatched = (status: OrderStatus) =>
    status === OrderStatus.shipped ||
    status === OrderStatus.outForDelivery ||
    status === OrderStatus.delivered;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-6">
      {sortedOrders.map((order) => (
        <div key={order.orderId.toString()} className="bg-card border-2 border-primary/20 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-display font-bold text-xl">Order #{order.orderId.toString()}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <PaymentStatusBadge
                paymentStatus={order.paymentStatus}
                paymentMethod={order.paymentMethod}
              />
              <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">Customer Details</h4>
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
              <h4 className="font-semibold mb-2">Payment</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Method:</span>{' '}
                  {order.paymentMethod === Variant_cashOnDelivery_online.cashOnDelivery
                    ? 'Cash on Delivery'
                    : 'Online Payment'}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{order.paymentStatus}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const product = products?.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="flex justify-between text-sm bg-muted/30 p-2 rounded">
                    <span>
                      {product?.name || 'Unknown Product'} x {item.quantity.toString()}
                    </span>
                    <span className="font-semibold">₹{Number(item.totalPrice)}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
              <span>Total:</span>
              <span>
                ₹{order.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)}
              </span>
            </div>
          </div>

          {order.status !== OrderStatus.cancelled && (
            <div>
              <label className="text-sm font-medium mb-2 block">Update Status:</label>
              <Select
                value={order.status}
                onValueChange={(value) => handleStatusChange(order.orderId, value as OrderStatus)}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrderStatus.orderPlaced}>Order Placed</SelectItem>
                  <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                  <SelectItem value={OrderStatus.outForDelivery}>Out for Delivery</SelectItem>
                  <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isDispatched(order.status) && (
            <DeliveryTimeInput
              orderId={order.orderId}
              existingValue={order.deliveryTime?.value}
              existingUnit={order.deliveryTime?.unit}
            />
          )}
        </div>
      ))}
    </div>
  );
}
