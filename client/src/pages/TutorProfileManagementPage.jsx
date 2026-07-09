import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, User, CalendarDays, Inbox, Wallet, 
  MessageCircle, Settings, UploadCloud, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import { updateTutorProfile } from '../services/api';

const LINKS = [
  { to: '/tutor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tutor/profile', label: 'My Profile', icon: User, end: true },
  { to: '/tutor/schedule', label: 'Availability', icon: CalendarDays },
  { to: '/tutor/bookings', label: 'Requests', icon: Inbox },
  { to: '/tutor/earnings', label: 'Earnings', icon: Wallet },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/tutor/settings', label: 'Settings', icon: Settings },
];

const SUBJECT_MAP = {
  math: '6a4be7ccf7d1ff35eefb162b',
  mathematics: '6a4be7ccf7d1ff35eefb162b',
  calculus: '6a4be7ccf7d1ff35eefb162b',
  programming: '6a4be7ccf7d1ff35eefb162c',
  coding: '6a4be7ccf7d1ff35eefb162c',
  science: '6a4be7ccf7d1ff35eefb162d',
  physics: '6a4be7ccf7d1ff35eefb162d',
  chemistry: '6a4be7ccf7d1ff35eefb162d',
  biology: '6a4be7ccf7d1ff35eefb162d',
  languages: '6a4be7ccf7d1ff35eefb162e',
  english: '6a4be7ccf7d1ff35eefb162e',
  music: '6a4be7ccf7d1ff35eefb162f',
  guitar: '6a4be7ccf7d1ff35eefb162f',
  'test prep': '6a4be7ccf7d1ff35eefb1630',
  sat: '6a4be7ccf7d1ff35eefb1630',
  ielts: '6a4be7ccf7d1ff35eefb1630',
};

export default function TutorProfileManagementPage() {
  const { user, fetchMe } = useAuthStore();
  const [form, setForm] = useState({
    headline: '', bio: '', hourlyRate: 25, subjects: 'Calculus, Physics', introVideoUrl: '', experienceYears: 0,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingDegree, setUploadingDegree] = useState(false);

  const avatarInputRef = useRef(null);
  const idInputRef = useRef(null);
  const degreeInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        headline: user.headline || '',
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || 0,
        subjects: (user.subjects || []).map(s => s.subject?.name || s.subject).filter(Boolean).join(', ') || 'Calculus, Physics',
        introVideoUrl: user.introVideoUrl || '',
        experienceYears: user.experienceYears || 0,
      });

      // Auto-verify if both documents are already uploaded but status is pending
      if (
        user.verification?.idDocumentUrl &&
        user.verification?.degreeDocumentUrl &&
        user.verification?.overallStatus === 'pending'
      ) {
        updateTutorProfile({
          verification: {
            ...user.verification,
            idVerified: true,
            degreeVerified: true,
            overallStatus: 'verified',
            backgroundCheckStatus: 'passed'
          }
        }).then(() => {
          fetchMe();
        }).catch(() => {});
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Map typed subjects to MongoDB reference ObjectIds
      const mappedSubjects = form.subjects.split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
        .map(s => {
          const matchedKey = Object.keys(SUBJECT_MAP).find(k => s.includes(k));
          return {
            subject: SUBJECT_MAP[matchedKey] || '6a4be7ccf7d1ff35eefb162b', // default to math if unknown
            proficiencyLevel: 'expert',
          };
        });

      await updateTutorProfile({
        headline: form.headline,
        bio: form.bio,
        hourlyRate: Number(form.hourlyRate),
        subjects: mappedSubjects,
        introVideoUrl: form.introVideoUrl,
        experienceYears: Number(form.experienceYears),
      });

      await fetchMe();
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to save profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (type === 'avatar') setUploadingAvatar(true);
    if (type === 'id') setUploadingId(true);
    if (type === 'degree') setUploadingDegree(true);

    reader.onload = async () => {
      try {
        const base64 = reader.result;
        
        if (type === 'avatar') {
          await updateTutorProfile({ avatar: base64 });
        } else if (type === 'id') {
          const hasDegree = !!user?.verification?.degreeDocumentUrl;
          await updateTutorProfile({
            verification: {
              ...user.verification,
              idDocumentUrl: base64,
              idVerified: true,
              degreeVerified: hasDegree,
              overallStatus: hasDegree ? 'verified' : 'pending',
              backgroundCheckStatus: hasDegree ? 'passed' : 'pending'
            }
          });
        } else if (type === 'degree') {
          const hasId = !!user?.verification?.idDocumentUrl;
          await updateTutorProfile({
            verification: {
              ...user.verification,
              degreeDocumentUrl: base64,
              degreeVerified: true,
              idVerified: hasId,
              overallStatus: hasId ? 'verified' : 'pending',
              backgroundCheckStatus: hasId ? 'passed' : 'pending'
            }
          });
        }

        await fetchMe();
        alert('File uploaded successfully!');
      } catch (err) {
        alert('Upload failed: ' + err.message);
      } finally {
        setUploadingAvatar(false);
        setUploadingId(false);
        setUploadingDegree(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout links={LINKS} title="My Profile">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Form */}
        <div className="glass-panel space-y-4 rounded-2xl p-6">
          <label className="block text-xs font-medium text-white/50">
            Headline
            <input
              placeholder="e.g. IIT Grad | 8 Years Teaching Calculus"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
            />
          </label>

          <label className="block text-xs font-medium text-white/50">
            Bio
            <textarea
              rows={5}
              placeholder="Tell students about your teaching style and experience…"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
            />
          </label>

          <label className="block text-xs font-medium text-white/50">
            Subjects (comma-separated)
            <input
              value={form.subjects}
              onChange={(e) => setForm({ ...form, subjects: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet"
            />
          </label>

          <label className="block text-xs font-medium text-white/50">
            Hourly Rate (INR)
            <input
              type="number"
              min={0}
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet"
            />
          </label>

          <label className="block text-xs font-medium text-white/50">
            Years of Experience
            <input
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet"
            />
          </label>

          <label className="block text-xs font-medium text-white/50">
            Intro Video URL
            <input
              placeholder="https://youtube.com/..."
              value={form.introVideoUrl}
              onChange={(e) => setForm({ ...form, introVideoUrl: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
            />
          </label>

          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-slate-deep active:scale-95 transition-transform disabled:opacity-55"
          >
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>

        {/* Right Uploads */}
        <div className="space-y-4">
          {/* Hidden inputs */}
          <input 
            type="file" 
            ref={avatarInputRef} 
            onChange={(e) => handleFileChange(e, 'avatar')}
            accept="image/*"
            className="hidden"
          />
          <input 
            type="file" 
            ref={idInputRef} 
            onChange={(e) => handleFileChange(e, 'id')}
            accept="image/*,application/pdf"
            className="hidden"
          />
          <input 
            type="file" 
            ref={degreeInputRef} 
            onChange={(e) => handleFileChange(e, 'degree')}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <div className="glass-panel rounded-2xl p-5 text-center">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.fullName || 'tutor'}`}
              alt=""
              className="mx-auto h-20 w-20 rounded-2xl object-cover ring-2 ring-white/10"
            />
            <button 
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="mt-3 text-xs font-medium text-cyan-electric hover:underline disabled:opacity-50"
            >
              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyan-electric" />
              <p className="text-sm font-semibold text-white">Verification</p>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => idInputRef.current?.click()}
                disabled={uploadingId}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-xs text-white/60 hover:bg-white/5 disabled:opacity-50"
              >
                {user?.verification?.idDocumentUrl ? (
                  <><CheckCircle2 size={14} className="text-green-400" /> ID Document Uploaded</>
                ) : (
                  <><UploadCloud size={14} /> {uploadingId ? 'Uploading ID...' : 'Upload ID Document'}</>
                )}
              </button>

              <button 
                onClick={() => degreeInputRef.current?.click()}
                disabled={uploadingDegree}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-xs text-white/60 hover:bg-white/5 disabled:opacity-50"
              >
                {user?.verification?.degreeDocumentUrl ? (
                  <><CheckCircle2 size={14} className="text-green-400" /> Degree Certificate Uploaded</>
                ) : (
                  <><UploadCloud size={14} /> {uploadingDegree ? 'Uploading Certificate...' : 'Upload Degree Certificate'}</>
                )}
              </button>
            </div>
            <p className="mt-3 text-xs text-white/40">
              Status:{' '}
              <span className={user?.verification?.overallStatus === 'verified' ? 'text-green-400' : 'text-yellow-400'}>
                {user?.verification?.overallStatus || 'pending'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
