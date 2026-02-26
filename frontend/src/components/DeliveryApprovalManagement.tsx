import { usePendingDeliveryProfiles, useApproveDeliveryPrincipal, useRejectDeliveryPrincipal } from '../hooks/useDeliveryApprovals';
import { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  Mail,
  Copy,
  Check,
  ClipboardList,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';
import { toast } from 'sonner';

function ProfileCard({ profile }: { profile: UserProfile }) {
  const approve = useApproveDeliveryPrincipal();
  const reject = useRejectDeliveryPrincipal();
  const [copied, setCopied] = useState(false);

  const principalText = profile.principalId.toText
    ? profile.principalId.toText()
    : String(profile.principalId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principalText);
      setCopied(true);
      toast.success('Principal ID copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleApprove = () => {
    const principal = Principal.fromText(principalText);
    approve.mutate(principal);
  };

  const handleReject = () => {
    const principal = Principal.fromText(principalText);
    reject.mutate(principal);
  };

  const isLoading = approve.isPending || reject.isPending;

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="pt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Name</p>
              <p className="font-semibold">{profile.fullName || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Contact</p>
              <p className="font-medium">{profile.contactNumber || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:col-span-2">
            <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Email</p>
              <p className="font-medium">{profile.email || '—'}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Principal ID</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted/50 rounded-md px-3 py-1.5 font-mono text-xs break-all">
              {principalText}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0 h-8 w-8"
              onClick={handleCopy}
              title="Copy Principal ID"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {approve.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Approve
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading}
            className="flex-1"
          >
            {reject.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1.5" />
                Reject
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DeliveryApprovalManagement() {
  const { data: profiles, isLoading } = usePendingDeliveryProfiles();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="max-w-xl">
        <div className="bg-card border-2 border-primary/20 rounded-lg p-8 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg mb-1">No Pending Requests</h3>
          <p className="text-muted-foreground text-sm">
            There are no pending delivery access requests at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {profiles.length} pending {profiles.length === 1 ? 'request' : 'requests'}
        </Badge>
      </div>
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.principalId.toText ? profile.principalId.toText() : String(profile.principalId)}
          profile={profile}
        />
      ))}
    </div>
  );
}
