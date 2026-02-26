import { useState } from 'react';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import { Variant_cashOnDelivery_online } from '../backend';

interface PaymentMethodSelectorProps {
  onSelect: (method: 'cod' | 'upi' | 'card') => void;
  selectedMethod: 'cod' | 'upi' | 'card' | null;
}

export default function PaymentMethodSelector({ onSelect, selectedMethod }: PaymentMethodSelectorProps) {
  return (
    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
      <h3 className="font-display font-bold text-xl mb-4">Payment Method</h3>
      <div className="space-y-3">
        <button
          onClick={() => onSelect('cod')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
            selectedMethod === 'cod'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Banknote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Cash on Delivery</h4>
              <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('upi')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
            selectedMethod === 'upi'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold">UPI Payment</h4>
              <p className="text-sm text-muted-foreground">Pay using UPI apps (instructions provided)</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('card')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
            selectedMethod === 'card'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold">Card Payment</h4>
              <p className="text-sm text-muted-foreground">Pay securely with credit/debit card via Stripe</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
