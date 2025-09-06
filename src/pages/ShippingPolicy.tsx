import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShippingPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Shipping Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Policy for Ultron Inov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Shipping Policy outlines our delivery terms, shipping methods, timelines, and related information for orders placed through Ultron Inov. We are committed to delivering your electronic components safely and on time.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Shipping Areas</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  We currently ship to the following locations:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Domestic:</strong> All states and union territories in India</li>
                  <li><strong>International:</strong> Selected countries (contact us for availability)</li>
                  <li><strong>Remote Areas:</strong> Some remote locations may have extended delivery times</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Processing Time</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Order processing times vary based on product availability:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>In Stock Items:</strong> 1-2 business days</li>
                  <li><strong>Pre-order Items:</strong> 7-14 business days</li>
                  <li><strong>Custom Orders:</strong> 10-21 business days</li>
                  <li><strong>Bulk Orders:</strong> 3-5 business days</li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  Note: Processing time starts after payment confirmation and order verification.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Shipping Methods</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Standard Shipping</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><strong>Delivery Time:</strong> 3-7 business days</li>
                    <li><strong>Tracking:</strong> Available</li>
                    <li><strong>Cost:</strong> ₹50-150 (based on weight and distance)</li>
                    <li><strong>Coverage:</strong> All major cities and towns</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Express Shipping</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><strong>Delivery Time:</strong> 1-3 business days</li>
                    <li><strong>Tracking:</strong> Real-time tracking</li>
                    <li><strong>Cost:</strong> ₹150-300 (based on weight and distance)</li>
                    <li><strong>Coverage:</strong> Metro cities and major towns</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Same Day Delivery</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><strong>Delivery Time:</strong> Same day (if ordered before 2 PM)</li>
                    <li><strong>Tracking:</strong> Live tracking</li>
                    <li><strong>Cost:</strong> ₹200-500</li>
                    <li><strong>Coverage:</strong> Limited to select metro cities</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Shipping Costs</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Shipping costs are calculated based on:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Package weight and dimensions</li>
                  <li>Delivery destination</li>
                  <li>Selected shipping method</li>
                  <li>Special handling requirements (fragile, hazardous materials)</li>
                </ul>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium text-sm">Free Shipping Threshold:</p>
                  <p className="text-muted-foreground text-sm">Orders above ₹2,000 qualify for free standard shipping</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Order Tracking</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Once your order is shipped, you will receive:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Shipping confirmation email with tracking number</li>
                  <li>SMS notification with tracking link</li>
                  <li>Real-time tracking updates</li>
                  <li>Delivery confirmation</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Delivery Attempts</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Our delivery partners will make up to 3 delivery attempts:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>First Attempt:</strong> During regular business hours</li>
                  <li><strong>Second Attempt:</strong> Next business day</li>
                  <li><strong>Third Attempt:</strong> Following business day</li>
                  <li><strong>After 3 Attempts:</strong> Package returned to sender</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Delivery Requirements</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  To ensure successful delivery:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Provide accurate and complete shipping address</li>
                  <li>Include landmark or building name for easy identification</li>
                  <li>Ensure someone is available to receive the package</li>
                  <li>Provide a valid contact number</li>
                  <li>For office deliveries, mention company name and floor</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Special Handling</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Some products require special handling:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Fragile Items:</strong> Extra protective packaging</li>
                  <li><strong>Electrostatic Sensitive:</strong> Anti-static packaging</li>
                  <li><strong>Temperature Sensitive:</strong> Climate-controlled shipping</li>
                  <li><strong>High-Value Items:</strong> Signature required upon delivery</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">10. International Shipping</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  For international orders:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Delivery time: 7-21 business days</li>
                  <li>Customs duties and taxes are customer's responsibility</li>
                  <li>Some products may be restricted in certain countries</li>
                  <li>Additional documentation may be required</li>
                  <li>Contact us before placing international orders</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">11. Delayed Deliveries</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  While we strive for timely delivery, delays may occur due to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Weather conditions</li>
                  <li>Transportation disruptions</li>
                  <li>Customs clearance (international orders)</li>
                  <li>Incorrect or incomplete address</li>
                  <li>Force majeure events</li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  We will notify you of any significant delays and work to resolve them promptly.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">12. Lost or Damaged Packages</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  If your package is lost or damaged during transit:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Contact us immediately with your order number</li>
                  <li>We will investigate with the shipping carrier</li>
                  <li>Replacement or refund will be provided if carrier is at fault</li>
                  <li>Insurance claims will be processed on your behalf</li>
                  <li>Resolution typically takes 5-10 business days</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For shipping inquiries or issues, please contact us:
              </p>
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <p><strong>Email:</strong> ultron.inov@gmail.com</p>
                <p><strong>Subject Line:</strong> Shipping Inquiry - [Order Number]</p>
                <p><strong>Response Time:</strong> Within 24 hours during business days</p>
                <p><strong>Business Hours:</strong> Monday to Friday, 9 AM to 6 PM IST</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">14. Policy Updates</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this Shipping Policy at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our service after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingPolicy;
