import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, Clock, Trophy, RotateCcw, ChevronRight, Zap, Target, BookOpen, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackgroundOrbs from '../components/BackgroundOrbs';

const QUIZ_SETS = [
  {
    id: 1, title: 'Python Basics Quiz', subject: 'Programming', difficulty: 'Beginner',
    questions: 8, duration: 10, rating: 4.8, plays: 3240,
    questions_data: [
      { q: 'What is the output of: print(type([]))?', options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>"], answer: 0 },
      { q: 'Which keyword is used to define a function in Python?', options: ['func', 'define', 'def', 'function'], answer: 2 },
      { q: 'What does len() return?', options: ['Last element', 'Length of an object', 'Memory address', 'Data type'], answer: 1 },
      { q: 'How do you start a comment in Python?', options: ['//', '/*', '#', '--'], answer: 2 },
    ],
  },
  {
    id: 2, title: 'Calculus Fundamentals', subject: 'Mathematics', difficulty: 'Intermediate',
    questions: 10, duration: 15, rating: 4.7, plays: 1876,
    questions_data: [
      { q: 'What is the derivative of x²?', options: ['x', '2x', 'x²', '2x²'], answer: 1 },
      { q: 'What is ∫2x dx?', options: ['x²+ C', '2x² + C', 'x + C', '4x + C'], answer: 0 },
      { q: "What is Newton's notation for derivative?", options: ["f'(x)", "∂f/∂x", "Δf", "∇f"], answer: 0 },
    ],
  },
  {
    id: 3, title: 'IELTS Vocabulary Challenge', subject: 'Languages', difficulty: 'Advanced',
    questions: 12, duration: 12, rating: 4.9, plays: 5421,
    questions_data: [
      { q: 'Choose the synonym for "Ubiquitous":', options: ['Rare', 'Omnipresent', 'Beautiful', 'Uncertain'], answer: 1 },
      { q: 'What does "Ephemeral" mean?', options: ['Permanent', 'Short-lived', 'Massive', 'Colorful'], answer: 1 },
      { q: '"Paradox" means:', options: ['A contradiction', 'A paradise', 'A paragraph', 'A parable'], answer: 0 },
    ],
  },
];

const DIFF_COLORS = { Beginner: 'text-green-400 bg-green-400/10', Intermediate: 'text-amber-400 bg-amber-400/10', Advanced: 'text-rose-400 bg-rose-400/10' };

function Confetti() {
  const colors = ['#6C63FF', '#00F2FE', '#FF6B6B', '#FFD93D', '#6BCB77'];
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0 }}
          animate={{ y: window.innerHeight + 20, opacity: 0, rotate: Math.random() * 720 }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'easeIn' }}
          style={{ position: 'absolute', width: 8, height: 8, borderRadius: Math.random() > 0.5 ? '50%' : '0', backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
        />
      ))}
    </div>
  );
}

function QuizGame({ quiz, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const questions = quiz.questions_data;

  useEffect(() => {
    if (finished || selected !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleSelect(-1);
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [current, selected, finished]);

  const handleSelect = (optIndex) => {
    if (selected !== null) return;
    setSelected(optIndex);
    const newAnswers = [...answers, { correct: optIndex === questions[current].answer, selected: optIndex }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setTimeLeft(30);
      } else {
        setFinished(true);
        const score = newAnswers.filter(a => a.correct).length;
        if (score / questions.length >= 0.7) setShowConfetti(true);
      }
    }, 900);
  };

  const score = answers.filter(a => a.correct).length;
  const pct = Math.round((score / questions.length) * 100);

  if (finished) {
    return (
      <div className="relative">
        {showConfetti && <Confetti />}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient shadow-glow"
          >
            <Trophy size={40} className="text-slate-deep" />
          </motion.div>
          <h2 className="mb-2 font-display text-3xl font-extrabold text-white">
            {pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good Job!' : '📚 Keep Practicing!'}
          </h2>
          <p className="mb-6 text-white/60">You scored {score} out of {questions.length} questions</p>
          <div className="mx-auto mb-6 flex max-w-xs items-center justify-center gap-8">
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold text-white">{pct}%</p>
              <p className="text-xs text-white/50">Score</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold text-green-400">{score}</p>
              <p className="text-xs text-white/50">Correct</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold text-rose-400">{questions.length - score}</p>
              <p className="text-xs text-white/50">Wrong</p>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={onBack} className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5">
              <RotateCcw size={14} /> Try Again
            </button>
            <button onClick={onBack} className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-slate-deep">
              Back to Quizzes
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">{quiz.title}</p>
          <p className="text-sm font-medium text-white">Question {current + 1} of {questions.length}</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${timeLeft <= 10 ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-white/70'}`}>
          <Clock size={14} />
          <span className="font-mono text-sm font-bold">{timeLeft}s</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          className="h-full rounded-full bg-brand-gradient"
        />
      </div>

      {/* Question */}
      <motion.h2
        key={current}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8 font-display text-xl font-bold text-white"
      >
        {q.q}
      </motion.h2>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          let style = 'glass-panel border-white/10 text-white/80 hover:border-violet/50 hover:bg-white/10';
          if (selected !== null) {
            if (i === q.answer) style = 'bg-green-500/20 border-green-400/50 text-green-300';
            else if (i === selected && i !== q.answer) style = 'bg-rose-500/20 border-rose-400/50 text-rose-300';
            else style = 'border-white/5 text-white/30 opacity-50';
          }
          return (
            <motion.button
              key={i}
              whileHover={selected === null ? { scale: 1.02 } : {}}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(i)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 ${style}`}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {selected !== null && i === q.answer && <CheckCircle size={16} className="ml-auto text-green-400" />}
              {selected !== null && i === selected && i !== q.answer && <XCircle size={16} className="ml-auto text-rose-400" />}
            </motion.button>
          );
        })}
      </div>

      {/* Mini score */}
      <div className="mt-6 flex items-center justify-between text-xs text-white/40">
        <span className="text-green-400">✓ {answers.filter(a => a.correct).length} correct</span>
        <span className="text-rose-400">✗ {answers.filter(a => !a.correct).length} wrong</span>
      </div>
    </motion.div>
  );
}

function QuizCard({ quiz, onStart, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -4 }}
      className="glass-panel flex flex-col rounded-2xl p-5 transition-all hover:border-white/20 hover:shadow-glow"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${DIFF_COLORS[quiz.difficulty]}`}>{quiz.difficulty}</span>
        <div className="flex items-center gap-1 text-xs text-amber-400">
          <Star size={12} className="fill-amber-400" /> {quiz.rating}
        </div>
      </div>
      <h3 className="mb-1 font-display font-semibold text-white">{quiz.title}</h3>
      <p className="mb-4 text-xs text-white/50">{quiz.subject}</p>
      <div className="mb-4 flex items-center gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1"><Target size={12} /> {quiz.questions} questions</span>
        <span className="flex items-center gap-1"><Clock size={12} /> ~{quiz.duration} min</span>
        <span className="flex items-center gap-1"><Zap size={12} /> {quiz.plays.toLocaleString()} played</span>
      </div>
      <button
        onClick={() => onStart(quiz)}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-slate-deep transition-transform active:scale-95"
      >
        Start Quiz <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}

export default function QuizPage() {
  const [activeQuiz, setActiveQuiz] = useState(null);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundOrbs />
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <AnimatePresence mode="wait">
          {activeQuiz ? (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => setActiveQuiz(null)}
                className="mb-6 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                ← Back to Quizzes
              </button>
              <QuizGame quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
                  <Brain size={32} className="text-slate-deep" />
                </div>
                <h1 className="font-display text-3xl font-extrabold text-white">
                  Interactive <span className="bg-brand-gradient bg-clip-text text-transparent">Quizzes</span>
                </h1>
                <p className="mt-2 text-white/50">Test your knowledge with timed quizzes crafted by expert tutors</p>
              </motion.div>

              {/* Stats */}
              <div className="mb-10 grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Quizzes', value: '240+', icon: BookOpen },
                  { label: 'Questions', value: '4,800+', icon: Target },
                  { label: 'Completed Today', value: '1,240', icon: Trophy },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel rounded-2xl p-5 text-center"
                  >
                    <s.icon size={20} className="mx-auto mb-2 text-violet" />
                    <p className="font-display text-2xl font-extrabold text-white">{s.value}</p>
                    <p className="text-xs text-white/50">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <h2 className="mb-6 font-display text-xl font-bold text-white">Featured Quizzes</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {QUIZ_SETS.map((quiz, i) => (
                  <QuizCard key={quiz.id} quiz={quiz} onStart={setActiveQuiz} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
