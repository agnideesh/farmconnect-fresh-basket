
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from "lucide-react";
import { useTheme } from 'next-themes';
import AnimatedButton from './UI/AnimatedButton';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Wait until component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';
  
  return (
    <AnimatedButton
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </AnimatedButton>
  );
};

export default ThemeToggle;
