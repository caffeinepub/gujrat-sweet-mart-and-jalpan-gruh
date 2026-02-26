import { OrderStatus } from '../backend';
import { CheckCircle2, Circle, Package, Truck, MapPin, Home } from 'lucide-react';

interface OrderTrackingTimelineProps {
  status: OrderStatus;
}

const STAGES = [
  {
    key: OrderStatus.orderPlaced,
    label: 'Order Placed',
    icon: Package,
  },
  {
    key: OrderStatus.shipped,
    label: 'Shipped',
    icon: Truck,
  },
  {
    key: OrderStatus.outForDelivery,
    label: 'Out for Delivery',
    icon: MapPin,
  },
  {
    key: OrderStatus.delivered,
    label: 'Delivered',
    icon: Home,
  },
];

const STATUS_ORDER = [
  OrderStatus.orderPlaced,
  OrderStatus.shipped,
  OrderStatus.outForDelivery,
  OrderStatus.delivered,
];

export default function OrderTrackingTimeline({ status }: OrderTrackingTimelineProps) {
  const isCancelled = status === OrderStatus.cancelled;
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-6 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-red-700 font-semibold text-sm">Order Cancelled</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Desktop layout */}
          <div className="hidden sm:flex items-center justify-between relative">
            {/* Progress line background */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted-foreground/20 z-0" />
            {/* Progress line filled */}
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
              style={{
                width: currentIndex >= 0
                  ? `${(currentIndex / (STAGES.length - 1)) * 100}%`
                  : '0%',
              }}
            />

            {STAGES.map((stage, idx) => {
              const isCompleted = currentIndex >= idx;
              const isCurrent = currentIndex === idx;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="flex flex-col items-center z-10 flex-1">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-card border-muted-foreground/30 text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium text-center leading-tight max-w-[80px] ${
                      isCompleted ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile layout */}
          <div className="sm:hidden space-y-3">
            {STAGES.map((stage, idx) => {
              const isCompleted = currentIndex >= idx;
              const isCurrent = currentIndex === idx;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-card border-muted-foreground/30 text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {stage.label}
                    </span>
                    {isCurrent && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div className={`h-0.5 w-4 ${isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
