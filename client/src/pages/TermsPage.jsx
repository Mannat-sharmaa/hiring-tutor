import StaticPageLayout from '../components/StaticPageLayout';

export default function TermsPage() {
  return (
    <StaticPageLayout title="Terms of Service" subtitle="Last updated: July 2026">
      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">1. Acceptance of Terms</h2>
        <p>By creating an account or booking a class on EduConnect, you agree to these Terms of Service.</p>
      </div>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">2. Platform Role</h2>
        <p>
          EduConnect is a marketplace connecting independent tutors with students. Tutors are not employees of
          EduConnect; they set their own rates and availability. EduConnect facilitates booking, payment, and
          communication, and charges a platform commission on completed paid classes.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">3. Payments & Refunds</h2>
        <p>
          Payment is collected at booking and held until class completion. Cancellations made within the
          window specified on the booking page are eligible for a full or partial refund per our cancellation
          policy. Disputes are handled through Admin mediation.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">4. Tutor Verification</h2>
        <p>
          Tutors must submit identity and, where applicable, degree documentation for verification before
          accepting bookings. EduConnect reserves the right to suspend or reject any tutor account that fails
          verification or violates platform conduct standards.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-white">5. Conduct</h2>
        <p>
          Harassment, discrimination, or attempts to move payment or communication off-platform to avoid fees
          are prohibited and may result in account suspension.
        </p>
      </div>

      <p className="text-xs text-white/40">
        This is placeholder terms text for a project scaffold and should be reviewed by legal counsel before
        real-world use.
      </p>
    </StaticPageLayout>
  );
}
