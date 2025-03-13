
import { useEffect } from 'react';

const ThemeInitializer: React.FC = () => {
  useEffect(() => {
    // Check for user preference in localStorage
    const storedTheme = localStorage.getItem('theme');
    
    // Check for system preference if no stored preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply theme based on stored preference or system preference
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return null;
};

export default ThemeInitializer;
