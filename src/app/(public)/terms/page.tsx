import { PageHeader } from "@/app/(public)/_components/page-header";

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl py-12">
      <PageHeader
        title="Terms of Service"
        description="Last updated: October 13, 2025"
      />
      <div className="prose dark:prose-invert mt-8">
        <p>
          Please read these Terms of Service ("Terms", "Terms of Service")
          carefully before using the Poultry Mitra application (the "Service")
          operated by us.
        </p>

        <h2>1. Accounts</h2>
        <p>
          When you create an account with us, you must provide us with
          information that is accurate, complete, and current at all times.
          Failure to do so constitutes a breach of the Terms, which may result
          in immediate termination of your account on our Service.
        </p>

        <h2>2. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of Poultry Mitra and its
          licensors.
        </p>

        <h2>3. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if you breach the Terms.
        </p>

        <h2>4. Limitation Of Liability</h2>
        <p>
          In no event shall Poultry Mitra, nor its directors, employees,
          partners, agents, suppliers, or affiliates, be liable for any
          indirect, incidental, special, consequential or punitive damages,
          including without limitation, loss of profits, data, use, goodwill,
          or other intangible losses, resulting from your access to or use of
          or inability to access or use the Service.
        </p>

        <h2>5. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the
          laws of India, without regard to its conflict of law provisions.
        </p>

        <h2>6. Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time.
        </p>
        
        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
          ipoultrymitra@gmail.com
        </p>
      </div>
    </div>
  );
}
