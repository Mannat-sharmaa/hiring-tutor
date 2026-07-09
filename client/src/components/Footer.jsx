import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 sm:grid-cols-5">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-lg font-extrabold text-white">
            Edu<span className="text-cyan-electric">Connect</span>
          </p>
          <p className="mt-2 text-sm text-white/40">Find your perfect tutor, anywhere.</p>
          <div className="mt-4 flex gap-3 text-white/40">
            <Facebook size={16} className="hover:text-white cursor-pointer transition-colors" />
            <Twitter size={16} className="hover:text-white cursor-pointer transition-colors" />
            <Instagram size={16} className="hover:text-white cursor-pointer transition-colors" />
            <Linkedin size={16} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">Company</p>
          <div className="space-y-2 text-sm text-white/60">
            <Link to="/about" className="block hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="block hover:text-white transition-colors">Contact Us</Link>
            <Link to="/signup" className="block hover:text-white transition-colors">Become a Tutor</Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">Features</p>
          <div className="space-y-2 text-sm text-white/60">
            <Link to="/ai-assistant" className="block hover:text-white transition-colors">AI Study Buddy</Link>
            <Link to="/study-rooms" className="block hover:text-white transition-colors">Study Rooms</Link>
            <Link to="/resources" className="block hover:text-white transition-colors">Resource Hub</Link>
            <Link to="/quizzes" className="block hover:text-white transition-colors">Quizzes</Link>
            <Link to="/themes" className="block hover:text-white transition-colors">Themes</Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">Legal</p>
          <div className="space-y-2 text-sm text-white/60">
            <Link to="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">Get Started</p>
          <div className="space-y-2 text-sm text-white/60">
            <Link to="/search" className="block hover:text-white transition-colors">Find a Tutor</Link>
            <Link to="/login" className="block hover:text-white transition-colors">Log In</Link>
            <Link to="/signup" className="block hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-7xl text-xs text-white/30">
        © {new Date().getFullYear()} EduConnect. All rights reserved.
      </p>
    </footer>
  );
}

