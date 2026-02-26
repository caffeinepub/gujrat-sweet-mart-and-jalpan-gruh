import { useState } from 'react';
import { useAssignDeliveryRole } from '../hooks/useDeliveryRole';
import { UserPlus, Loader2, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function DeliveryStaffManagement() {
  const [principalInput, setPrincipalInput] = useState('');
  const assignRole = useAssignDeliveryRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = principalInput.trim();
    if (!trimmed) return;
    await assignRole.mutateAsync(trimmed);
    if (!assignRole.isError) {
      setPrincipalInput('');
    }
  };

  return (
    <div className="max-w-xl">
      <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold">Grant Delivery Role</h2>
        </div>

        <div className="flex items-start gap-2 bg-muted/50 rounded-md p-3 mb-6 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
          <p>
            Enter the principal ID of the delivery person. They can find their principal ID by logging in and checking their profile. Once granted, they will be able to access the Delivery Dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal-input">Principal ID</Label>
            <Input
              id="principal-input"
              type="text"
              placeholder="e.g. aaaaa-aa or xxxxx-xxxxx-xxxxx-xxxxx-cai"
              value={principalInput}
              onChange={(e) => setPrincipalInput(e.target.value)}
              disabled={assignRole.isPending}
              className="font-mono text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={assignRole.isPending || !principalInput.trim()}
            className="w-full"
          >
            {assignRole.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning Role...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Grant Delivery Role
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
