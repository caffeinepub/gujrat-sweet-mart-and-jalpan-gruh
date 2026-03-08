import {
  ChevronDown,
  ChevronUp,
  Coins,
  Gift,
  History,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  type LoyaltyTransaction,
  useGetMyLoyaltyAccount,
  useGetMyLoyaltyTransactions,
} from "../hooks/useLoyalty";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

function getTxTypeLabel(txType: LoyaltyTransaction["txType"]) {
  switch (txType.__kind__) {
    case "earned":
      return { label: "Earned", color: "text-green-600" };
    case "redeemed":
      return { label: "Redeemed", color: "text-blue-600" };
    case "reversed":
      return { label: "Reversed", color: "text-red-500" };
    case "finalized":
      return { label: "Finalized", color: "text-amber-600" };
    case "adminAdjustment":
      return { label: "Admin Adjustment", color: "text-purple-600" };
    default:
      return { label: "Transaction", color: "text-muted-foreground" };
  }
}

function formatTimestamp(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function LoyaltyCard() {
  const { data: account, isLoading: accountLoading } = useGetMyLoyaltyAccount();
  const { data: transactions, isLoading: txLoading } =
    useGetMyLoyaltyTransactions();
  const [showHistory, setShowHistory] = useState(false);

  const confirmedPoints = Number(account?.confirmedPoints ?? 0n);
  const pendingPoints = Number(account?.pendingPoints ?? 0n);
  const rupeeValue = (confirmedPoints / 10).toFixed(2);

  if (accountLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg leading-tight">
              My Rewards
            </h3>
            <p className="text-white/80 text-xs">Gujarat Sweet Mart Loyalty</p>
          </div>
        </div>
        <Gift className="h-6 w-6 text-white/60" />
      </div>

      {/* Points display */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div
            className="bg-white/70 rounded-xl p-4 text-center border border-amber-100"
            data-ocid="loyalty.confirmed_points.card"
          >
            <p className="text-3xl font-bold text-amber-600 leading-none">
              {confirmedPoints.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-semibold text-amber-800 mt-1">
              Confirmed Points
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ≈ ₹{rupeeValue} discount
            </p>
          </div>
          <div className="bg-white/70 rounded-xl p-4 text-center border border-orange-100">
            <p className="text-3xl font-bold text-orange-500 leading-none">
              {pendingPoints.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-semibold text-orange-800 mt-1">
              Pending Points
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              After delivery
            </p>
          </div>
        </div>

        {/* Earning info */}
        <div className="bg-amber-100/50 rounded-lg px-4 py-3 mb-4 text-xs text-amber-900">
          <p className="font-semibold mb-0.5">How it works:</p>
          <p>
            🪙 Earn <strong>1 point per ₹10</strong> spent on orders
          </p>
          <p>
            💰 <strong>10 points = ₹1 discount</strong> on your next order
          </p>
          <p>⏳ Points are confirmed after your order is delivered</p>
        </div>

        {/* Transaction history toggle */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
          onClick={() => setShowHistory(!showHistory)}
          data-ocid="loyalty.history.toggle"
        >
          <History className="h-4 w-4 mr-2" />
          Transaction History
          {showHistory ? (
            <ChevronUp className="h-4 w-4 ml-auto" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-auto" />
          )}
        </Button>
      </div>

      {/* Transaction history panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-amber-200"
          >
            <div className="px-6 py-4">
              {txLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div
                  className="text-center py-4"
                  data-ocid="loyalty.history.empty_state"
                >
                  <p className="text-sm text-muted-foreground">
                    No transactions yet
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {[...transactions]
                      .sort((a, b) => Number(b.timestamp - a.timestamp))
                      .map((tx: LoyaltyTransaction, idx: number) => {
                        const { label, color } = getTxTypeLabel(tx.txType);
                        const isPositive =
                          tx.txType.__kind__ === "earned" ||
                          tx.txType.__kind__ === "finalized" ||
                          (tx.txType.__kind__ === "adminAdjustment" &&
                            Number(tx.points) > 0);
                        return (
                          <div
                            key={tx.txId.toString()}
                            className="flex items-start justify-between bg-white/60 rounded-lg px-3 py-2.5 text-sm"
                            data-ocid={`loyalty.history.item.${idx + 1}`}
                          >
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-semibold ${color}`}
                                >
                                  {label}
                                </span>
                                {tx.orderId !== null && (
                                  <span className="text-xs text-muted-foreground">
                                    Order #{tx.orderId.toString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {tx.reason}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(tx.timestamp)}
                              </p>
                            </div>
                            <span
                              className={`ml-3 font-bold text-sm whitespace-nowrap ${
                                isPositive ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              {isPositive ? "+" : "-"}
                              {Math.abs(Number(tx.points))} pts
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
