import { ref } from 'vue';

const isDark = ref(true);

export function useTheme() {
  const initTheme = () => {
    const saved = localStorage.getItem('sparta_theme');
    if (saved) {
      isDark.value = saved === 'dark';
    } else {
      // Default to dark mode or system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
  };

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    localStorage.setItem('sparta_theme', isDark.value ? 'dark' : 'light');
    applyTheme();
  };

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return { isDark, initTheme, toggleTheme };
}