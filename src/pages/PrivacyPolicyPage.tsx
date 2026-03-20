import PublicPageLayout from "@/layouts/PublicPageLayout";

const PrivacyPolicyPage = () => (
  <PublicPageLayout>
    <div className="container max-w-3xl prose prose-invert prose-sm">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 text-center not-prose">
        Privacy Policy
      </h1>
      <p className="text-center text-muted-foreground mb-12 not-prose">
        Last updated: March 18, 2026
      </p>

      <h2>1. Introduction</h2>
      <p>
        Chetti ("we", "us", "our"), operated by Paisol Technology, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
        <li><strong>Chatbot Data:</strong> System prompts, knowledge base documents, and chatbot configurations you create.</li>
        <li><strong>Usage Data:</strong> Message counts, feature usage, and interaction analytics.</li>
        <li><strong>Payment Information:</strong> Processed securely via Stripe. We do not store your full payment details.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain the Chetti platform.</li>
        <li>To process payments and manage subscriptions.</li>
        <li>To send important updates, security alerts, and support communications.</li>
        <li>To improve our services and develop new features.</li>
      </ul>

      <h2>4. Data Storage & Security</h2>
      <p>
        Your data is stored securely on cloud infrastructure with encryption at rest and in transit. We implement industry-standard security measures to protect your information.
      </p>

      <h2>5. Third-Party Services</h2>
      <p>
        We use the following third-party services:
      </p>
      <ul>
        <li><strong>Stripe</strong> for payment processing.</li>
        <li><strong>Resend</strong> for transactional emails.</li>
        <li><strong>AI model providers</strong> (Google, OpenAI) for chatbot responses — your data is processed according to their respective privacy policies.</li>
      </ul>

      <h2>6. Your Rights</h2>
      <p>
        You have the right to access, update, or delete your personal data at any time. You can do this through your account settings or by contacting us at <a href="mailto:support@paisoltechnology.com" className="text-primary">support@paisoltechnology.com</a>.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain your data for as long as your account is active. Upon account deletion, your data will be permanently removed within 30 days.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification.
      </p>

      <h2>9. Contact</h2>
      <p>
        For questions about this Privacy Policy, contact us at{" "}
        <a href="mailto:support@paisoltechnology.com" className="text-primary">support@paisoltechnology.com</a>.
      </p>
    </div>
  </PublicPageLayout>
);

export default PrivacyPolicyPage;
