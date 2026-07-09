import { useEffect, useState } from 'react';

// Delays updating the returned value until `delay` ms after the input stops
// changing — used so the search API isn't hit on every keystroke.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
