import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
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
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terms of Service for Ultron Inov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Ultron Inov website (ultroninov-a6a1e.web.app) and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ultron Inov provides an online platform for the sale of electronic components, microcontrollers, development boards, and related products. Our service includes product browsing, ordering, payment processing, and customer support.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  To access certain features of our service, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Product Information and Pricing</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  We strive to provide accurate product information, descriptions, and pricing. However:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Product images are for illustrative purposes and may vary from actual products</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Product availability is subject to stock levels</li>
                  <li>We reserve the right to correct any errors in pricing or product information</li>
                  <li>All prices are in Indian Rupees (₹) unless otherwise specified</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Orders and Payment</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  When you place an order:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>You are making an offer to purchase products at the listed price</li>
                  <li>We reserve the right to accept or decline your order</li>
                  <li>Payment must be made at the time of order placement</li>
                  <li>We accept various payment methods including credit/debit cards and digital wallets</li>
                  <li>All payments are processed securely through third-party payment processors</li>
                  <li>You are responsible for any applicable taxes and fees</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Shipping and Delivery</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Shipping terms and conditions:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Delivery times are estimates and not guaranteed</li>
                  <li>Risk of loss transfers to you upon delivery</li>
                  <li>You are responsible for providing accurate shipping information</li>
                  <li>Additional charges may apply for remote or special delivery locations</li>
                  <li>We are not responsible for delays caused by shipping carriers</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Returns and Refunds</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Our return and refund policy:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Returns must be initiated within 7 days of delivery</li>
                  <li>Products must be in original condition with packaging</li>
                  <li>Custom or personalized items are not eligible for return</li>
                  <li>Refunds will be processed within 5-7 business days after return approval</li>
                  <li>Return shipping costs are the responsibility of the customer</li>
                  <li>Defective products will be replaced or refunded at our discretion</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on our website, including text, graphics, logos, images, and software, is the property of Ultron Inov or its content suppliers and is protected by copyright and other intellectual property laws. You may not use, reproduce, or distribute any content without our written permission.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Ultron Inov, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">11. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, Ultron Inov excludes all representations, warranties, conditions and terms relating to our website and the use of this website.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service shall be interpreted and governed by the laws of India. Any disputes arising from these terms or your use of our service shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last updated" date. Your continued use of our service after any modifications constitutes acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <p><strong>Email:</strong> ultron.inov@gmail.com</p>
                <p><strong>Website:</strong> ultroninov-a6a1e.web.app</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
