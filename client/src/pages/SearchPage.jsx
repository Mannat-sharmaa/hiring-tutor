import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import FilterChips from '../components/FilterChips';
import TutorCard from '../components/TutorCard';
import TutorCardSkeleton from '../components/TutorCardSkeleton';
import useDebounce from '../hooks/useDebounce';
import { searchTutors } from '../services/api';
import MOCK_TUTORS from '../services/mockTutors';

const SORT_OPTIONS = [
  { value: 'best_match', label: 'Best Match' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'most_booked', label: 'Most Booked' },
];

import FloatingSymbols from '../components/FloatingSymbols';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('best_match');
  const [tutors, setTutors] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const sentinelRef = useRef(null);

  // Refetch from page 1 whenever the query, filters, or sort change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);

    const params = {
      q: debouncedQuery || undefined,
      studentLevel: filters.studentLevel?.join(','),
      board: filters.board?.join(','),
      language: filters.language?.join(','),
      teachingMode: filters.teachingMode || undefined,
      minRating: filters.minRating || undefined,
      maxPrice: filters.maxPrice || undefined,
      idVerified: filters.idVerified || undefined,
      sortBy,
      page: 1,
      limit: 9,
    };

    searchTutors(params)
      .then((data) => {
        if (cancelled) return;
        setTutors(data.results);
        setHasMore(data.pagination.hasMore);
        setUsingFallback(false);
      })
      .catch(() => {
        // No backend running yet — fall back to local sample data so the
        // page is still usable while the API/frontend are developed in parallel.
        if (cancelled) return;
        setTutors(MOCK_TUTORS);
        setHasMore(false);
        setUsingFallback(true);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filters, sortBy]);

  const loadMore = useCallback(() => {
    if (usingFallback || !hasMore || loading) return;
    const nextPage = page + 1;
    searchTutors({ q: debouncedQuery || undefined, sortBy, page: nextPage, limit: 9 }).then((data) => {
      setTutors((prev) => [...prev, ...data.results]);
      setHasMore(data.pagination.hasMore);
      setPage(nextPage);
    });
  }, [page, hasMore, loading, usingFallback, debouncedQuery, sortBy]);

  // Infinite scroll: fetch the next page once the sentinel enters the viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background particles and orbs */}
      <FloatingSymbols />
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 animate-breathe bg-orb-gradient blur-3xl" />

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Find Your Perfect <span className="bg-brand-gradient bg-clip-text text-transparent">Tutor</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {usingFallback
              ? 'Showing sample tutors — connect the API to see live results.'
              : 'Search across every subject, level, and language.'}
          </p>
        </motion.div>

        <div className="mx-auto mb-6 max-w-2xl">
          <SearchBar value={query} onChange={setQuery} onSubmit={setQuery} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <FilterChips filters={filters} onChange={setFilters} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-panel rounded-lg px-3 py-2 text-xs text-white outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-indigo text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {loading && page === 1
                ? Array.from({ length: 6 }).map((_, i) => <TutorCardSkeleton key={i} />)
                : (
                  <AnimatePresence mode="popLayout">
                    {tutors.map((tutor, i) => (
                      <motion.div 
                        key={tutor._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                      >
                        <TutorCard
                          tutor={tutor}
                          index={i}
                          onOpen={(t) => navigate(`/tutors/${t._id}`)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
            </motion.div>

            {!loading && tutors.length === 0 && (
              <div className="mt-16 text-center text-white/50">
                No tutors match these filters yet. Try widening your search.
              </div>
            )}

            <div ref={sentinelRef} className="h-10" />
          </section>
        </div>
      </main>
    </div>
  );
}
