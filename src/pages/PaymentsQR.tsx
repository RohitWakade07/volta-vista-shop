import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Phone, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UPI_ID = '7517769211@upi';
const COMMUNITY_URL = 'https://chat.whatsapp.com/DTXpXQY5zvyIQRmcpUXGHP';

const PaymentsQR = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || '';
  const amount = params.get('amount') || '';
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handlePaid = () => {
    navigate(`/payment/success?orderId=${encodeURIComponent(orderId)}`);
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast({
        title: "UPI ID Copied!",
        description: "The UPI ID has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy UPI ID:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy UPI ID. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-2xl py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>Scan the QR or pay via UPI ID. Amount will be verified shortly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <img src="/qrcode.webp" alt="UPI QR" className="w-72 h-72 rounded-md border" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">UPI ID</div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-lg font-semibold font-mono">{UPI_ID}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUPI}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {amount && <Badge>Amount: ₹{Number(amount).toFixed(0)}</Badge>}
            </div>

            {/* Important Payment Note */}
            <Alert className="border-amber-200 bg-amber-50/50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <Phone className="h-4 w-4" />
                  Important: Add Your Phone Number
                </div>
                <div className="text-sm">
                  Please include your phone number in the payment note/description when making the payment. 
                  This helps us identify and process your order quickly.
                </div>
              </AlertDescription>
            </Alert>
            <div className="pt-2">
              <Button onClick={handlePaid} className="w-full" size="lg">If Payment Successful, Click Here To Proceed</Button>
              <p className="text-xs text-muted-foreground text-center mt-2">You’ll be able to see your order shortly after we confirm the payment.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsQR;






