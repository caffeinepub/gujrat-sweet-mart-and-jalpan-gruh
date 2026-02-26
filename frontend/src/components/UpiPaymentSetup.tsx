import { useState, useRef, useEffect } from 'react';
import { useGetUpiConfig, useSetUpiConfig } from '../hooks/useUpiConfig';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader2, CheckCircle2, QrCode, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UpiPaymentSetup() {
  const { data: upiConfig, isLoading: isLoadingConfig } = useGetUpiConfig();
  const setUpiConfig = useSetUpiConfig();

  const [upiId, setUpiId] = useState('');
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [qrBytes, setQrBytes] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-populate form with existing config
  useEffect(() => {
    if (upiConfig) {
      setUpiId(upiConfig.upiId);
      const url = upiConfig.qrCode.getDirectURL();
      setQrPreviewUrl(url);
    }
  }, [upiConfig]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG or JPG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(result) as Uint8Array<ArrayBuffer>;
        setQrBytes(bytes);
        const blob = new Blob([bytes], { type: file.type });
        const previewUrl = URL.createObjectURL(blob);
        setQrPreviewUrl(previewUrl);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSave = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter a UPI ID');
      return;
    }

    if (!qrBytes && !upiConfig?.qrCode) {
      toast.error('Please upload a QR code image');
      return;
    }

    try {
      setSaveSuccess(false);
      setIsUploading(true);

      if (qrBytes) {
        await setUpiConfig.mutateAsync({
          upiId: upiId.trim(),
          qrCodeBytes: qrBytes,
        });
      } else if (upiConfig?.qrCode) {
        const existingBytes = await upiConfig.qrCode.getBytes();
        await setUpiConfig.mutateAsync({
          upiId: upiId.trim(),
          qrCodeBytes: existingBytes as Uint8Array<ArrayBuffer>,
        });
      }

      setSaveSuccess(true);
      toast.success('UPI payment configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save UPI config:', error);
      toast.error('Failed to save UPI configuration. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const isSaving = setUpiConfig.isPending || isUploading;

  if (isLoadingConfig) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <QrCode className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl">UPI Payment Setup</h3>
          <p className="text-sm text-muted-foreground">Configure your UPI ID and QR code for customer payments</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">UPI configuration saved successfully!</span>
        </div>
      )}

      {upiConfig && !saveSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">UPI payment is currently configured. You can update it below.</span>
        </div>
      )}

      <div className="space-y-5">
        {/* UPI ID Input */}
        <div>
          <Label htmlFor="upiId" className="text-sm font-semibold mb-1.5 block">
            UPI ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="upiId"
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi or yourname@bank"
            className="font-mono"
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Example: merchant@okaxis, shop@ybl, business@paytm
          </p>
        </div>

        {/* QR Code Upload */}
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">
            UPI QR Code Image <span className="text-destructive">*</span>
          </Label>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Preview */}
            <div className="w-40 h-40 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center bg-muted/20 flex-shrink-0 overflow-hidden">
              {qrPreviewUrl ? (
                <img
                  src={qrPreviewUrl}
                  alt="UPI QR Code Preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center p-4">
                  <QrCode className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No QR code uploaded</p>
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {qrPreviewUrl ? 'Change QR Code' : 'Upload QR Code'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Accepted formats: PNG, JPG. Max size: 5MB.
              </p>
              {qrBytes && (
                <div className="flex items-center gap-1.5 text-xs text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  New QR code image selected
                </div>
              )}
              {!qrBytes && !upiConfig?.qrCode && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Please upload a QR code image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !upiId.trim()}
          className="w-full sm:w-auto"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save UPI Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
