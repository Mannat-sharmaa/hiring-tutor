import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Users, CreditCard, MessageSquareWarning, Settings, ChevronRight, Plus, Trash2, ListTree } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ADMIN_LINKS from '../constants/adminLinks';

// Nested tree mirroring the Subject model (Level -> Category -> Subject -> Topic)
const INITIAL_TREE = [
  {
    id: 'l1', name: 'High School (9-10)', children: [
      { id: 'c1', name: 'Mathematics', children: [
        { id: 's1', name: 'Calculus', children: [{ id: 't1', name: 'Integration' }, { id: 't2', name: 'Differentiation' }] },
        { id: 's2', name: 'Algebra', children: [] },
      ] },
      { id: 'c2', name: 'Programming', children: [
        { id: 's3', name: 'Python', children: [{ id: 't3', name: 'OOP' }] },
      ] },
    ],
  },
  {
    id: 'l2', name: 'Hobby', children: [
      { id: 'c3', name: 'Music', children: [{ id: 's4', name: 'Guitar', children: [{ id: 't4', name: 'Chords' }] }] },
    ],
  },
];

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 18 }}>
      <div className="group flex items-center justify-between rounded-lg py-1.5 pr-2 hover:bg-white/5">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-sm text-white/80">
          {hasChildren ? (
            <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight size={14} className="text-white/40" />
            </motion.span>
          ) : (
            <span className="w-3.5" />
          )}
          {node.name}
        </button>
        <div className="hidden gap-2 group-hover:flex">
          <button className="text-white/30 hover:text-cyan-electric"><Plus size={13} /></button>
          <button className="text-white/30 hover:text-red-400"><Trash2 size={13} /></button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminSubjectsPage() {
  return (
    <DashboardLayout links={ADMIN_LINKS} title="Subject & Category Management">
      <div className="mb-4 flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-xs font-semibold text-slate-deep">
          <Plus size={14} /> Add Education Level
        </button>
      </div>
      <div className="glass-panel rounded-2xl p-5">
        {INITIAL_TREE.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
      <p className="mt-3 text-xs text-white/40">
        Drag-and-drop reordering, inline renaming, and icon assignment connect to the Subject model's
        `order`/`parent` fields via the admin subject endpoints already built on the backend.
      </p>
    </DashboardLayout>
  );
}
