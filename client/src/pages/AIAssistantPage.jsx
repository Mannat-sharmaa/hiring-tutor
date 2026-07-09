import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, BookOpen, Calculator, Code, Music, Globe,
  FlaskConical, User, Lightbulb, RefreshCw, Star, Clock,
  Zap, Heart, GraduationCap, Mic, MonitorPlay, Users, Target, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackgroundOrbs from '../components/BackgroundOrbs';
import FloatingSymbols from '../components/FloatingSymbols';
import api from '../services/api';

// ─── Subject + Teacher Label Database ────────────────────────────────────────
const SUBJECT_DB = {
  math: { subject: 'Mathematics', emoji: '📐', color: 'text-violet', bg: 'bg-violet/15', border: 'border-violet/30' },
  mathematics: { subject: 'Mathematics', emoji: '📐', color: 'text-violet', bg: 'bg-violet/15', border: 'border-violet/30' },
  calculus: { subject: 'Mathematics', emoji: '📐', color: 'text-violet', bg: 'bg-violet/15', border: 'border-violet/30' },
  algebra: { subject: 'Mathematics', emoji: '📐', color: 'text-violet', bg: 'bg-violet/15', border: 'border-violet/30' },
  geometry: { subject: 'Mathematics', emoji: '📐', color: 'text-violet', bg: 'bg-violet/15', border: 'border-violet/30' },
  maths: { subject: 'Mathematics', emoji: '📐', color: 'text-violet', bg: 'bg-violet/15', border: 'border-violet/30' },

  python: { subject: 'Programming', emoji: '🐍', color: 'text-cyan-electric', bg: 'bg-cyan-electric/15', border: 'border-cyan-electric/30' },
  coding: { subject: 'Programming', emoji: '💻', color: 'text-cyan-electric', bg: 'bg-cyan-electric/15', border: 'border-cyan-electric/30' },
  programming: { subject: 'Programming', emoji: '💻', color: 'text-cyan-electric', bg: 'bg-cyan-electric/15', border: 'border-cyan-electric/30' },
  javascript: { subject: 'Programming', emoji: '⚡', color: 'text-amber-400', bg: 'bg-amber-400/15', border: 'border-amber-400/30' },
  react: { subject: 'Programming', emoji: '⚛️', color: 'text-cyan-electric', bg: 'bg-cyan-electric/15', border: 'border-cyan-electric/30' },

  physics: { subject: 'Science', emoji: '⚛️', color: 'text-blue-400', bg: 'bg-blue-400/15', border: 'border-blue-400/30' },
  chemistry: { subject: 'Science', emoji: '🧪', color: 'text-green-400', bg: 'bg-green-400/15', border: 'border-green-400/30' },
  biology: { subject: 'Science', emoji: '🧬', color: 'text-emerald-400', bg: 'bg-emerald-400/15', border: 'border-emerald-400/30' },
  science: { subject: 'Science', emoji: '🔬', color: 'text-blue-400', bg: 'bg-blue-400/15', border: 'border-blue-400/30' },

  english: { subject: 'Languages', emoji: '🇬🇧', color: 'text-rose-400', bg: 'bg-rose-400/15', border: 'border-rose-400/30' },
  ielts: { subject: 'Languages', emoji: '📝', color: 'text-rose-400', bg: 'bg-rose-400/15', border: 'border-rose-400/30' },
  languages: { subject: 'Languages', emoji: '🗣️', color: 'text-rose-400', bg: 'bg-rose-400/15', border: 'border-rose-400/30' },

  guitar: { subject: 'Music', emoji: '🎸', color: 'text-amber-400', bg: 'bg-amber-400/15', border: 'border-amber-400/30' },
  music: { subject: 'Music', emoji: '🎵', color: 'text-pink-400', bg: 'bg-pink-400/15', border: 'border-pink-400/30' },

  sat: { subject: 'Test Prep', emoji: '📊', color: 'text-amber-400', bg: 'bg-amber-400/15', border: 'border-amber-400/30' },
};

// ─── Teacher Style Labels ──────────────────────────────────────────────────
const TEACHER_STYLES = {
  strict: {
    labelEn: 'Strict & Disciplined',
    labelHi: 'Strict & Disciplined',
    icon: Target,
    descEn: 'Follows structured curriculum, strict deadlines, exam-focused',
    descHi: 'Structured curriculum, time table and clear goals follow karein',
    color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30'
  },
  friendly: {
    labelEn: 'Friendly & Patient',
    labelHi: 'Friendly & Patient',
    icon: Heart,
    descEn: 'Encouraging, supportive, beginner-friendly approach',
    descHi: 'Pyaar se samjhane wale, supportive aur beginner-friendly',
    color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30'
  },
  practical: {
    labelEn: 'Practical & Project-Based',
    labelHi: 'Practical & Project-Based',
    icon: Zap,
    descEn: 'Learn by doing — real projects, hands-on practice',
    descHi: 'Practical knowledge, coding projects aur tools use krein',
    color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30'
  },
  conceptual: {
    labelEn: 'Concept-Focused',
    labelHi: 'Concept-Focused',
    icon: GraduationCap,
    descEn: 'Deep understanding, theory-first, builds strong foundations',
    descHi: 'Ratta marne ke bajaye basic concepts strong krein',
    color: 'text-violet', bg: 'bg-violet/10', border: 'border-violet/30'
  },
  conversational: {
    labelEn: 'Conversational & Fun',
    labelHi: 'Conversational & Fun',
    icon: Mic,
    descEn: 'Interactive discussions, gamified sessions, engaging style',
    descHi: 'Dosto ki tarah baatein karke, interactive tarike se seekhein',
    color: 'text-cyan-electric', bg: 'bg-cyan-electric/10', border: 'border-cyan-electric/30'
  },
  exam: {
    labelEn: 'Exam Specialist',
    labelHi: 'Exam Specialist',
    icon: Award,
    descEn: 'Past paper focus, exam strategies, score maximizer',
    descHi: 'Exam formats, scoring tricks aur past papers check krein',
    color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30'
  },
};

const mapTutorStyle = (tutor, requestedStyle) => {
  if (requestedStyle && TEACHER_STYLES[requestedStyle]) {
    return requestedStyle;
  }
  const type = tutor.tutorType || '';
  if (type === 'industry_expert') return 'practical';
  if (type === 'student_tutor') return 'friendly';
  if (type === 'school_teacher') return 'strict';
  if (type === 'college_professor') return 'conceptual';
  if (type === 'language_expert') return 'conversational';
  return 'exam';
};

// ─── AI Brain: Analyzes user message ────────────────────────────────────────
function analyzeMessage(text) {
  const lower = text.toLowerCase();

  // Detect language: Default is English, switch to Hinglish if indicators found
  let detectedLang = 'en';
  const hinglishIndicators = [
    'chahiye', 'chahie', 'dhundo', 'batao', 'dikhaye', 'de do', 'dedo', 'krna', 'karna',
    'hai', 'hoon', 'hu', 'hoon', 'kya', 'ka', 'ke', 'ko', 'me', 'mein', 'sikhna', 'he',
    'yrr', 'yaar', 'kr', 'kro', 'krdo', 'kaise', 'thoda', 'bata', 'sawaal', 'acha',
    'achha', 'nhi', 'nahi', 'dikhado', 'lele', 'labb'
  ];
  
  const hasHinglish = hinglishIndicators.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
  if (hasHinglish) {
    detectedLang = 'hinglish';
  }

  // Detect greetings
  let greetingType = null;
  if (lower.includes('namaste')) {
    greetingType = 'namaste';
    detectedLang = 'hinglish'; // Namaste switches to Hinglish
  } else if (lower.includes('good morning')) {
    greetingType = 'good_morning';
  } else if (lower.includes('good afternoon') || lower.includes('good evening')) {
    greetingType = 'good_time';
  } else if (lower.includes('salam') || lower.includes('assalam')) {
    greetingType = 'salam';
    detectedLang = 'hinglish';
  } else if (/hello|hi|hey|hola/i.test(lower)) {
    greetingType = 'generic';
  }

  // Detect subject
  let detectedSubject = null;
  for (const [keyword, data] of Object.entries(SUBJECT_DB)) {
    if (lower.includes(keyword)) {
      detectedSubject = data;
      break;
    }
  }

  // Detect teaching style preference
  let detectedStyle = null;
  if (/strict|discipline|serious|tough|hard/i.test(lower)) detectedStyle = 'strict';
  else if (/friendly|patient|slow|beginner|easy|gentle/i.test(lower)) detectedStyle = 'friendly';
  else if (/project|practical|hands.?on|build|real/i.test(lower)) detectedStyle = 'practical';
  else if (/concept|theory|understand|deep|foundation/i.test(lower)) detectedStyle = 'conceptual';
  else if (/fun|interactive|engaging|game|conver/i.test(lower)) detectedStyle = 'conversational';
  else if (/exam|test|score|band|sat|ielts|paper/i.test(lower)) detectedStyle = 'exam';

  const isTutorQuery = /teacher|tutor|recommend|suggest|find|want|need|chahiye|dedo|de do|looking|labb/i.test(lower);
  const isAboutPlatform = /what is|how does|platform|website|educonnect/i.test(lower);

  return { detectedSubject, detectedStyle, isTutorQuery, greetingType, isAboutPlatform, lang: detectedLang };
}

// ─── AI Response Generator ────────────────────────────────────────────────
function generateResponse(text, analysis, dbTutors) {
  const { detectedSubject, detectedStyle, isTutorQuery, greetingType, isAboutPlatform, lang } = analysis;

  // 1. Handle Greetings
  if (greetingType) {
    if (lang === 'hinglish') {
      if (greetingType === 'namaste') {
        return {
          text: "Namaste! 🙏 EduConnect AI Study Buddy mein aapka swagat hai!\n\nMujhe batayein:\n• Kis **subject** ke liye tutor chahiye? (e.g. Math, Python, Physics)\n• Kaisa **teaching style** prefer karte hain? (Strict, Friendly, Practical...)\n\nMain database se perfect match dhundh dunga! 🎯",
          showLabel: null,
          showTutors: null,
        };
      }
      if (greetingType === 'salam') {
        return {
          text: "Walaikum Assalam! 👋 Main aapka AI Study Buddy hoon!\n\nMujhe batayein kaunse subject ka teacher chahiye aur aap kis teaching style se seekhna chahte hain? 📚✨",
          showLabel: null,
          showTutors: null,
        };
      }
      return {
        text: "Hello! 👋 Main aapka AI Study Buddy hoon! Mujhe batayein kis subject ke liye aur kis tarah ka teacher chahiye? (Friendly, Strict, ya Practical?) 🧠",
        showLabel: null,
        showTutors: null,
      };
    } else {
      // English Greetings
      if (greetingType === 'good_morning') {
        return {
          text: "Good morning! ☀️ I am your AI Study Buddy. How can I help you today? Please tell me which subject and teacher style you are looking for.",
          showLabel: null,
          showTutors: null,
        };
      }
      if (greetingType === 'good_time') {
        return {
          text: "Good day! 🌟 How can I help you with your learning goals today? Tell me the subject and teaching style you prefer.",
          showLabel: null,
          showTutors: null,
        };
      }
      return {
        text: "Hello! 👋 I am your AI Study Buddy. Tell me:\n\n• Which **subject**? (e.g. Math, Python, Physics)\n• What **teaching style**? (Strict, Friendly, Practical...)\n\nI will find you the perfect matches from our verified tutor list! 🎯",
        showLabel: null,
        showTutors: null,
      };
    }
  }

  // 2. Handle Platform Info Query
  if (isAboutPlatform) {
    if (lang === 'hinglish') {
      return {
        text: "EduConnect ek premium tutor booking platform hai! 🚀\n\n✅ **10,000+** verified tutors\n✅ **Live 1-on-1** video classes\n✅ **Interactive whiteboard** included\n✅ **Secure payments** via Stripe\n\nKaunse subject ke expert se seekhna chahte hain? Mujhe batayein! 🎓",
        showLabel: null,
        showTutors: null,
      };
    } else {
      return {
        text: "EduConnect is a premium tutor hiring platform! 🚀\n\n✅ **10,000+** verified tutors\n✅ **Live 1-on-1** online video classrooms\n✅ **Interactive whiteboard** & notes\n✅ **Secure bookings** via Stripe\n\nLet me know which subject you want to master! 🎓",
        showLabel: null,
        showTutors: null,
      };
    }
  }

  // 3. Handle Tutor Matching Query
  if (detectedSubject && isTutorQuery) {
    const styleInfo = detectedStyle ? TEACHER_STYLES[detectedStyle] : null;
    const tutorsWithStyle = (dbTutors || []).map(t => ({
      ...t,
      style: mapTutorStyle(t, detectedStyle),
    }));

    if (lang === 'hinglish') {
      const styleText = styleInfo
        ? `Aur aapko **${styleInfo.labelHi}** teacher chahiye — bilkul sahi pasand! `
        : '';
      return {
        text: `**${detectedSubject.emoji} ${detectedSubject.subject}** ke liye main ne best verified teachers real database se fetch kar liye hain! ${styleText}\n\nNeeche aapke matched tutors hain — click karke profile check karein: 👇`,
        showLabel: detectedStyle ? TEACHER_STYLES[detectedStyle] : null,
        showTutors: tutorsWithStyle,
        subjectInfo: detectedSubject,
      };
    } else {
      const styleText = styleInfo
        ? `And you prefer a **${styleInfo.labelEn}** teaching style — excellent! `
        : '';
      return {
        text: `I have fetched the best verified tutors for **${detectedSubject.emoji} ${detectedSubject.subject}** directly from our database! ${styleText}\n\nHere are your matched tutors — click below to view their profile: 👇`,
        showLabel: detectedStyle ? TEACHER_STYLES[detectedStyle] : null,
        showTutors: tutorsWithStyle,
        subjectInfo: detectedSubject,
      };
    }
  }

  // 4. Handle Subject Mention without Direct Tutor Query
  if (detectedSubject && !isTutorQuery) {
    if (lang === 'hinglish') {
      return {
        text: `**${detectedSubject.emoji} ${detectedSubject.subject}** — bahut badiya! Yeh ek behad important subject hai.\n\n🎯 **Recommendation:**\nSabse pehle core basics strong karein, regular practice karein, aur verified tutor ke saath classes lein.\n\nKya main aapke liye **${detectedSubject.subject} ke verified tutors** suggest karun? 🧠`,
        showLabel: null,
        showTutors: null,
        subjectInfo: detectedSubject,
      };
    } else {
      return {
        text: `**${detectedSubject.emoji} ${detectedSubject.subject}** — great choice! This is a highly rewarding subject to learn.\n\n🎯 **Tutor Tip:**\nWe recommend focusing on core concepts first, then regular practice sheets with an expert.\n\nWould you like me to recommend some **verified tutors for ${detectedSubject.subject}**? Just let me know! 😊`,
        showLabel: null,
        showTutors: null,
        subjectInfo: detectedSubject,
      };
    }
  }

  // 5. Handle Teaching Style Mention Only
  if (detectedStyle && !detectedSubject) {
    const styleInfo = TEACHER_STYLES[detectedStyle];
    if (lang === 'hinglish') {
      return {
        text: `**${styleInfo.labelHi}** teacher — bahut badiya teaching style hai! ${styleInfo.descHi}.\n\nAapko kis **subject** ke liye aise teacher chahiye? Mujhe bataiye! 📚`,
        showLabel: styleInfo,
        showTutors: null,
      };
    } else {
      return {
        text: `**${styleInfo.labelEn}** tutor — great preference! ${styleInfo.descEn}.\n\nWhich **subject** are you looking for? Let me know so I can match you with the right profile! 📚`,
        showLabel: styleInfo,
        showTutors: null,
      };
    }
  }

  // 6. Fallback Response
  if (lang === 'hinglish') {
    return {
      text: "Achha! Mujhe thoda aur batayein:\n\n• Kis **subject** ka tutor chahiye?\n• Kaisa **style** prefer karte hain? (Strict, Friendly, Practical...)\n\nMain database se best verified options matches nikaal dunga! 🎯",
      showLabel: null,
      showTutors: null,
    };
  } else {
    return {
      text: "I want to help you find the right fit! Could you please specify:\n\n• Which **subject** you need help with?\n• Your preferred **teaching style**? (Strict, Friendly, Practical...)\n\nI will query our real database and return matches! 🎯",
      showLabel: null,
      showTutors: null,
    };
  }
}

// ─── Components ────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          className="h-2 w-2 rounded-full bg-cyan-electric/60"
        />
      ))}
    </div>
  );
}

function TeacherLabel({ style, lang }) {
  const Icon = style.icon;
  const label = lang === 'hinglish' ? style.labelHi : style.labelEn;
  const desc = lang === 'hinglish' ? style.descHi : style.descEn;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mt-3 flex items-center gap-3 rounded-xl border p-3 ${style.bg} ${style.border}`}
    >
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
        <Icon size={18} className={style.color} />
      </div>
      <div>
        <p className={`text-xs font-bold ${style.color}`}>🏷️ Teacher Style: {label}</p>
        <p className="text-[10px] text-white/50 mt-0.5">{desc}</p>
      </div>
    </motion.div>
  );
}

function TutorMatchCard({ tutor, lang, index = 0 }) {
  const navigate = useNavigate();
  const styleInfo = TEACHER_STYLES[tutor.style];
  const StyleIcon = styleInfo?.icon || Star;
  const avatarUrl = tutor.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${tutor.fullName}`;
  const styleLabel = styleInfo ? (lang === 'hinglish' ? styleInfo.labelHi : styleInfo.labelEn) : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 100, 
        damping: 14, 
        delay: index * 0.12 
      }}
      className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-electric/30 hover:shadow-[0_0_15px_rgba(0,242,254,0.15)] transition-all duration-300"
    >
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6C63FF, #00F2FE)' }} />
      <div className="p-3">
        <div className="flex items-start gap-3">
          <img
            src={avatarUrl}
            alt={tutor.fullName}
            className="h-12 w-12 flex-shrink-0 rounded-xl border border-white/10 object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-white">{tutor.fullName}</p>
              <span className="rounded-full bg-brand-gradient px-2 py-0.5 text-[9px] font-bold text-slate-deep">
                Verified
              </span>
            </div>
            <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5">{tutor.headline}</p>
            <div className="mt-1 flex items-center gap-3 text-[10px] text-white/50">
              <span className="flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" />{tutor.ratingAverage || '4.8'}</span>
              <span className="flex items-center gap-1"><Clock size={10} />{tutor.experienceYears} yrs exp</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-extrabold text-cyan-electric">${tutor.hourlyRate}</p>
            <p className="text-[9px] text-white/40">/hr</p>
          </div>
        </div>

        {styleInfo && (
          <div className={`mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 ${styleInfo.bg}`}>
            <StyleIcon size={11} className={styleInfo.color} />
            <span className={`text-[10px] font-semibold ${styleInfo.color}`}>{styleLabel}</span>
          </div>
        )}

        <button
          onClick={() => navigate(`/tutors/${tutor._id}`)}
          className="mt-2.5 w-full rounded-xl bg-brand-gradient py-2 text-xs font-bold text-slate-deep transition-transform active:scale-95"
        >
          {lang === 'hinglish' ? 'Profile Dekhein & Demo Book Karein' : 'View Profile & Book Session'}
        </button>
      </div>
    </motion.div>
  );
}

function SubjectBadge({ subject }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${subject.bg} ${subject.border} ${subject.color}`}
    >
      <span>{subject.emoji}</span> {subject.subject}
    </motion.div>
  );
}

function Message({ msg }) {
  const isAI = msg.from === 'ai';

  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className={i > 0 ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isAI ? 'bg-brand-gradient' : 'bg-violet/20 border border-violet/30'}`}>
        {isAI ? <Bot size={16} className="text-slate-deep" /> : <User size={16} className="text-violet" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isAI ? 'glass-panel rounded-tl-none text-white/80' : 'bg-brand-gradient rounded-tr-none text-slate-deep font-medium'}`}>
        {renderText(msg.text)}
        {msg.subjectInfo && <SubjectBadge subject={msg.subjectInfo} />}
        {msg.showLabel && <TeacherLabel style={msg.showLabel} lang={msg.detectedLang} />}
        {msg.showTutors && (
          <div className="mt-1 space-y-2">
            {msg.showTutors.map((t, index) => (
              <TutorMatchCard key={t._id} tutor={t} lang={msg.detectedLang} index={index} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Quick Prompt Chips ─────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '🐍 Python teacher chahiye', text: 'Mujhe Python programming ka practical teacher chahiye' },
  { label: '📐 Math tutor (friendly)', text: 'Mujhe Math ka friendly aur patient tutor chahiye' },
  { label: '📝 IELTS expert', text: 'IELTS exam ke liye specialist tutor recommend karo' },
  { label: '⚛️ Physics expert', text: 'Physics ke liye concept-focused teacher chahiye' },
  { label: '🎸 Guitar sikhna hai', text: 'Guitar sikhna chahta hoon, teacher suggest karo' },
  { label: '💻 Strict coding coach', text: 'Programming ke liye strict aur disciplined teacher chahiye' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1, from: 'ai',
      text: "Hello! 👋 I am your **AI Teacher Matcher**!\n\nJust tell me:\n• Which **subject** you need help with? (Math, Python, Physics, IELTS...)\n• What type of **teacher** do you prefer? (Strict, Friendly, Practical...)\n\nI will find the perfect tutor from our database! 🎯",
      showLabel: null, showTutors: null, subjectInfo: null, detectedLang: 'en'
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  // Magnetic send button states
  const sendButtonRef = useRef(null);
  const [sendOffset, setSendOffset] = useState({ x: 0, y: 0 });

  const handleSendMouseMove = (e) => {
    const rect = sendButtonRef.current.getBoundingClientRect();
    const mouseX = e.clientX - (rect.left + rect.width / 2);
    const mouseY = e.clientY - (rect.top + rect.height / 2);
    // Draw cursor in with a moderate multiplier (0.35)
    setSendOffset({ x: mouseX * 0.35, y: mouseY * 0.35 });
  };

  const handleSendMouseLeave = () => {
    setSendOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');

    const userMsg = { id: Date.now(), from: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const analysis = analyzeMessage(userText);

    let dbTutors = null;
    if (analysis.detectedSubject && analysis.isTutorQuery) {
      try {
        const { data } = await api.get('/tutors/search');
        const list = data.results || [];

        const subjectName = analysis.detectedSubject.subject.toLowerCase();
        dbTutors = list.filter(t => {
          const matchesSubject = t.subjects?.some(s =>
            s.subject?.name?.toLowerCase().includes(subjectName) ||
            s.subject?.slug?.toLowerCase().includes(subjectName)
          );
          const matchesText = t.headline?.toLowerCase().includes(subjectName) ||
                              t.bio?.toLowerCase().includes(subjectName);
          return matchesSubject || matchesText;
        });

        if (dbTutors.length === 0) {
          dbTutors = list.slice(0, 3);
        }
      } catch (err) {
        console.error('Error fetching real tutors:', err);
      }
    }

    const response = generateResponse(userText, analysis, dbTutors);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'ai',
        detectedLang: analysis.lang,
        ...response,
      }]);
    }, 1000);
  };

  const handleReset = () => {
    setMessages([{
      id: 1, from: 'ai',
      text: "Chat has been reset! 🔄 Tell me what subject and teacher style you are looking for.",
      showLabel: null, showTutors: null, subjectInfo: null, detectedLang: 'en'
    }]);
    setInput('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundOrbs />
      <FloatingSymbols />
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pb-20 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
            <Bot size={32} className="text-slate-deep" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white">
            AI Teacher <span className="bg-brand-gradient bg-clip-text text-transparent">Matcher</span>
          </h1>
          <p className="mt-2 text-white/50">Subject bolo → Teacher type batao → Perfect tutor milega! 🎯</p>

          {/* How it works pills */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { icon: BookOpen, text: 'Subject detection', color: 'text-cyan-electric' },
              { icon: Target, text: 'Teaching style matching', color: 'text-violet' },
              { icon: Users, text: 'Verified tutor recommendations', color: 'text-emerald-400' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 rounded-full glass-panel px-3 py-1.5 text-xs text-white/60">
                <item.icon size={12} className={item.color} /> {item.text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chat Window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col overflow-hidden rounded-3xl glass-panel"
          style={{ height: '580px' }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="text-xs font-medium text-white/60">AI Teacher Matcher — Online</span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map(msg => <Message key={msg.id} msg={msg} />)}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient">
                  <Bot size={16} className="text-slate-deep" />
                </div>
                <div className="glass-panel rounded-2xl rounded-tl-none">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-2xl glass-panel px-4 py-2 focus-within:border-cyan-electric/40 transition-colors">
              <Sparkles size={16} className="text-cyan-electric/60 flex-shrink-0" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="e.g. 'Good morning, show me Python tutors' or 'Namaste, Math teacher chahiye'..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
              <motion.button
                ref={sendButtonRef}
                onMouseMove={handleSendMouseMove}
                onMouseLeave={handleSendMouseLeave}
                animate={{ x: sendOffset.x, y: sendOffset.y }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient disabled:opacity-40 transition-opacity"
              >
                <Send size={14} className="text-slate-deep" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Prompts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-white/40">
            <Lightbulb size={12} /> Try karo — ek click mein teacher dhundo:
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((q) => (
              <motion.button
                key={q.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(q.text)}
                className="rounded-full glass-panel px-3 py-1.5 text-xs text-white/70 hover:border-cyan-electric/40 hover:text-white transition-colors"
              >
                {q.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
