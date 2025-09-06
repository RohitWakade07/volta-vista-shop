import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
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
            <h1 className="text-3xl font-bold">Refund Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Refund Policy for Ultron Inov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Ultron Inov, we strive to provide high-quality electronic components and excellent customer service. This Refund Policy outlines the terms and conditions under which refunds, returns, and exchanges are processed for products purchased through our website.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Eligibility for Refunds</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Refunds may be requested under the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Product is defective or damaged upon arrival</li>
                  <li>Product does not match the description on our website</li>
                  <li>Wrong product was shipped due to our error</li>
                  <li>Product is returned within the specified return period</li>
                  <li>Order was cancelled before shipment</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Return Timeframe</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Return requests must be initiated within:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>7 days</strong> from the date of delivery for standard returns</li>
                  <li><strong>30 days</strong> for defective products (from delivery date)</li>
                  <li><strong>Before shipment</strong> for order cancellations</li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  Note: Return period starts from the date of delivery confirmation, not the order date.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Return Conditions</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  To be eligible for a refund, returned products must:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Be in original, unopened packaging</li>
                  <li>Include all original accessories, manuals, and documentation</li>
                  <li>Not show signs of use, damage, or wear</li>
                  <li>Be returned with the original invoice or receipt</li>
                  <li>Not be custom-made or personalized items</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Non-Refundable Items</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  The following items are not eligible for refunds:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Custom or personalized products</li>
                  <li>Software licenses or digital downloads</li>
                  <li>Products damaged by misuse or negligence</li>
                  <li>Items returned after the return period</li>
                  <li>Products with missing accessories or documentation</li>
                  <li>Items purchased during clearance or final sale</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Refund Process</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Step 1: Initiate Return</h3>
                  <p className="text-muted-foreground">
                    Contact our customer service team at ultron.inov@gmail.com with your order number and reason for return.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Step 2: Return Authorization</h3>
                  <p className="text-muted-foreground">
                    We will review your request and provide a Return Merchandise Authorization (RMA) number if approved.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Step 3: Ship Product</h3>
                  <p className="text-muted-foreground">
                    Package the product securely and ship it to the address provided with the RMA number clearly visible.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Step 4: Inspection and Refund</h3>
                  <p className="text-muted-foreground">
                    Upon receipt, we will inspect the product and process your refund within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Refund Methods</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Refunds will be processed using the same payment method used for the original purchase:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                  <li><strong>Digital Wallets:</strong> 3-5 business days</li>
                  <li><strong>Bank Transfer:</strong> 7-10 business days</li>
                  <li><strong>Cash on Delivery:</strong> Bank transfer or digital wallet</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Shipping Costs</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Shipping cost responsibility depends on the reason for return:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Defective/Damaged Products:</strong> We cover return shipping costs</li>
                  <li><strong>Wrong Product Shipped:</strong> We cover return shipping costs</li>
                  <li><strong>Customer Change of Mind:</strong> Customer pays return shipping</li>
                  <li><strong>Order Cancellation (before shipment):</strong> No shipping costs</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Partial Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                In certain cases, we may offer partial refunds if:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>Product is returned in less than perfect condition</li>
                <li>Some accessories are missing but the main product is intact</li>
                <li>Product shows minor signs of use but is otherwise functional</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Exchange Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We offer exchanges for products of equal or higher value. If the replacement product costs more, you will be charged the difference. If it costs less, we will refund the difference. Exchange requests are subject to the same conditions as returns.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">11. International Returns</h2>
              <p className="text-muted-foreground leading-relaxed">
                For international orders, return shipping costs are the responsibility of the customer. Refunds will be processed in the original currency, and any currency conversion fees or international transaction fees are non-refundable.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <p><strong>Email:</strong> ultron.inov@gmail.com</p>
                <p><strong>Subject Line:</strong> Refund Request - [Order Number]</p>
                <p><strong>Response Time:</strong> Within 24 hours during business days</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">13. Policy Updates</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our service after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;
