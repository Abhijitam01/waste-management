'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="relative p-2 rounded-lg border border-border hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      <Sun
        className={`absolute h-4 w-4 transition-all ${
          resolvedTheme === 'dark' ? 'scale-0' : 'scale-100'
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all ${
          resolvedTheme === 'dark' ? 'scale-100' : 'scale-0'
        }`}
      />
    </button>
  );
}

