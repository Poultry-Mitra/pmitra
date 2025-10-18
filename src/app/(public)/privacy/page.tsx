import { PageHeader } from "@/components/ui/page-header";

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <PageHeader
        variant="centered"
        title="Privacy Policy"
        description="Last updated: October 13, 2025"
      />
      <div className="prose dark:prose-invert mt-8">
        <p>
          Welcome to Poultry Mitra. We are committed to protecting your privacy.
          This Privacy Policy explains how your personal information is
          collected, used, and disclosed by Poultry Mitra.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We may collect personal information that you provide to us, such as
          your name, email address, and contact details when you register for an
          account. We also collect data related to your farm, such as flock
          details, feed consumption, and other metrics you provide.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to operate and maintain our
          service, to provide you with analytics and insights, to communicate
          with you, and to improve our application.
        </p>

        <h2>3. Sharing Your Information</h2>
        <p>
          We do not sell, trade, or otherwise transfer to outside parties your
          personally identifiable information. This does not include trusted
          third parties who assist us in operating our application, so long as
          those parties agree to keep this information confidential.
        </p>

        <h2>4. Security</h2>
        <p>
          The security of your personal information is important to us, but
          remember that no method of transmission over the Internet, or method
          of electronic storage, is 100% secure. We use Firebase Authentication
          and Firestore Security Rules to protect your data.
        </p>

        <h2>5. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at: ipoultrymitra@gmail.com
        </p>
      </div>
    </div>
  );
}
