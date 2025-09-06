import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy for Ultron Inov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Ultron Inov ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ultroninov-a6a1e.web.app or use our services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Account credentials and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Usage Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Website usage data and analytics</li>
                    <li>Device information and IP address</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Purchase history and preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order confirmations, shipping updates, and account notifications</li>
                <li>Improve our website, products, and services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>With service providers who assist in our operations (payment processors, shipping companies)</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
                <li>With your explicit consent</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie settings through your browser preferences.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Access and review your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Data portability</li>
                <li>Withdraw consent for marketing communications</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our services after any modifications constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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

export default PrivacyPolicy;
