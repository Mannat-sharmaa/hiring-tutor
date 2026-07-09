import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = [
  { text: 'Math Tutor', gradient: 'from-violet via-fuchsia-500 to-rose-400' },
  { text: 'Coding Coach', gradient: 'from-cyan-electric via-blue-500 to-indigo-500' },
  { text: 'Science Guru', gradient: 'from-emerald-400 via-teal-500 to-cyan-electric' },
  { text: 'IELTS Expert', gradient: 'from-amber-400 via-orange-500 to-rose-500' },
  { text: 'Music Mentor', gradient: 'from-pink-400 via-purple-500 to-violet' },
];

export default function TypewriterHero() {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = WORDS[index].text;
    let timer;

    if (isDeleting) {
      // Deleting speed
      timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
      }, 50);
    } else {
      // Typing speed
      timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
      }, 100);
    }

    // Handle states
    if (!isDeleting && displayText === currentWord) {
      // Pause at full word before deleting
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % WORDS.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index]);

  return (
    <span className="relative inline-block min-w-[280px] text-left sm:min-w-[420px]">
      <span className={`bg-gradient-to-r ${WORDS[index].gradient} bg-clip-text text-transparent transition-all duration-700`}>
        {displayText}
      </span>
      {/* Animated blinking typewriter cursor */}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="ml-1 inline-block h-[40px] w-1 bg-cyan-electric sm:h-[55px] align-middle"
        style={{ transform: 'translateY(-2px)' }}
      />
    </span>
  );
}
