import StaticPageLayout from '../components/StaticPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout title="Privacy Policy" subtitle="Last updated: July 2026">
      <p>
        This Privacy Policy explains how EduConnect ("we", "us") collects, uses, and protects information
        when you use our platform to find, book, or provide tutoring services.
      </p>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">Information We Collect</h2>
        <p>
          We collect information you provide directly — name, email, payment details, profile content — as
          well as information generated through your use of the platform, such as booking history, messages
          sent through our chat system, and class attendance records.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">How We Use Information</h2>
        <p>
          We use your information to operate the platform: matching students with tutors, processing
          payments, verifying tutor credentials, sending booking notifications, and improving our
          recommendation system. We do not sell personal data to third parties.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">Data Security</h2>
        <p>
          Passwords are hashed and never stored in plain text. Payment processing is handled by PCI-compliant
          third-party providers (Stripe/Razorpay) — we do not store full card numbers on our servers.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">Your Rights</h2>
        <p>
          You can request a copy of your data, ask us to correct inaccuracies, or request account deletion at
          any time from Settings, or by contacting support@educonnect.com.
        </p>
      </div>

      <p className="text-xs text-white/40">
        This is placeholder policy text for a project scaffold and should be reviewed by legal counsel before
        real-world use.
      </p>
    </StaticPageLayout>
  );
}
