import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useSetStripeConfiguration } from '../hooks/useStripeCheckout';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StripePaymentSetup() {
  const { actor } = useActor();
  const setConfig = useSetStripeConfiguration();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('IN,US,GB,CA');

  useEffect(() => {
    checkConfiguration();
  }, [actor]);

  const checkConfiguration = async () => {
    if (!actor) return;
    try {
      const configured = await actor.isStripeConfigured();
      setIsConfigured(configured);
    } catch (error) {
      console.error('Failed to check Stripe configuration:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error('Please enter Stripe secret key');
      return;
    }

    const allowedCountries = countries.split(',').map((c) => c.trim()).filter(Boolean);
    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one country code');
      return;
    }

    try {
      await setConfig.mutateAsync({ secretKey, allowedCountries });
      setIsConfigured(true);
      toast.success('Stripe configured successfully');
    } catch (error) {
      console.error('Failed to configure Stripe:', error);
      toast.error('Failed to configure Stripe');
    }
  };

  if (isChecking) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isConfigured) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">Stripe Payment Configured</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
      <h3 className="font-display font-bold text-xl mb-4 text-yellow-900">Configure Stripe Payment</h3>
      <p className="text-sm text-yellow-800 mb-4">
        To enable card payments, please configure your Stripe integration.
      </p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="secretKey">Stripe Secret Key *</Label>
          <Input
            id="secretKey"
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="sk_test_..."
          />
        </div>
        <div>
          <Label htmlFor="countries">Allowed Countries (comma-separated) *</Label>
          <Input
            id="countries"
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            placeholder="IN,US,GB,CA"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Example: IN,US,GB,CA (use ISO country codes)
          </p>
        </div>
        <Button onClick={handleSave} disabled={setConfig.isPending} className="w-full">
          {setConfig.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Configuring...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </div>
    </div>
  );
}
