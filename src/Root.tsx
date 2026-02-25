import { useState, useEffect, useCallback } from "react";
import App from "./App";
import { ThemeProvider } from "./themes/ThemeProvider";
import { ThemeLab } from "./ThemeLab";
import { Palette } from "lucide-react";

export const Root = () => {
  const [labOpen, setLabOpen] = useState(false);

  const toggleLab = useCallback(() => setLabOpen((prev) => !prev), []);

  // Ctrl+Shift+T keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleLab();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleLab]);

  return (
    <ThemeProvider>
      <App />
      <ThemeLab isOpen={labOpen} onClose={() => setLabOpen(false)} />
      {/* FAB toggle */}
      {!labOpen && (
        <button
          type="button"
          onClick={toggleLab}
          aria-label="Open Theme Lab"
          title="Theme Lab (Ctrl+Shift+T)"
          className="fixed bottom-24 lg:bottom-6 right-4 z-[9998] p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/60 hover:text-white hover:bg-black/80 shadow-lg transition-all hover:scale-110"
        >
          <Palette size={18} />
        </button>
      )}
    </ThemeProvider>
  );
};
