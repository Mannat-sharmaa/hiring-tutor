import { GraduationCap, Target, Users } from 'lucide-react';
import StaticPageLayout from '../components/StaticPageLayout';

export default function AboutPage() {
  return (
    <StaticPageLayout title="About EduConnect" subtitle="Connecting curious minds with great teachers, everywhere.">
      <p>
        EduConnect started with a simple observation: finding the right tutor is harder than it should be.
        Parents ask around for recommendations, students scroll through unreviewed listings, and tutors
        struggle to reach the students they could genuinely help. We built EduConnect to fix that — a single
        place to search, compare, book, and learn from verified tutors across every subject and level.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <Target size={20} className="text-violet" />
          <p className="mt-3 font-display text-sm font-semibold text-white">Our Mission</p>
          <p className="mt-1 text-xs text-white/50">
            Make quality, personalized education accessible to every student, regardless of location or background.
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <GraduationCap size={20} className="text-violet" />
          <p className="mt-3 font-display text-sm font-semibold text-white">Our Vision</p>
          <p className="mt-1 text-xs text-white/50">
            A world where the best teacher for you is always just a search away.
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <Users size={20} className="text-violet" />
          <p className="mt-3 font-display text-sm font-semibold text-white">Our Community</p>
          <p className="mt-1 text-xs text-white/50">
            Tens of thousands of students and verified tutors learning and teaching together every week.
          </p>
        </div>
      </div>

      <p>
        Every tutor on EduConnect goes through an identity and credential verification process before they can
        accept bookings. We take a small commission on completed classes — that's it. No hidden subscriptions,
        no pay-to-rank listings that mislead students.
      </p>
    </StaticPageLayout>
  );
}
