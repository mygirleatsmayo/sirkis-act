import { useState, useCallback, useEffect } from "react";
import App from "./App";
import { ThemeProvider } from "./themes/ThemeProvider";
import { ThemeLab } from "./ThemeLab";
import { SettingsModal } from "./SettingsModal";
import { Palette } from "lucide-react";
import { useTheme } from "./themes/useTheme";

const RootContent = () => {
  const { theme } = useTheme();
  const isThemeLabLocked = theme.editor.kind === 'locked';
  const [labOpen, setLabOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const openLab = useCallback(() => setLabOpen(true), []);
  const closeLab = useCallback(() => setLabOpen(false), []);

  useEffect(() => {
    if (isThemeLabLocked) {
      if (labOpen) setLabOpen(false);
      if (showFab) setShowFab(false);
    }
  }, [isThemeLabLocked, labOpen, showFab]);

  return (
    <>
      <App onOpenSettings={openSettings} />
      <ThemeLab isOpen={labOpen} onClose={closeLab} />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={closeSettings}
        onOpenThemeLab={openLab}
        onCloseThemeLab={closeLab}
        showFab={showFab}
        onToggleFab={setShowFab}
      />
      {/* Opt-in FAB for Theme Lab quick access */}
      {showFab && !isThemeLabLocked && !labOpen && !settingsOpen && (
        <button
          type="button"
          onClick={openLab}
          aria-label="Open Theme Lab"
          className="fixed bottom-24 lg:bottom-6 right-4 z-[9998] p-3 rounded-full bg-black/60 backdrop-blur-md border border-muted text-content-subtle hover:text-content-primary hover:bg-black/80 shadow-lg transition-all hover:scale-110"
        >
          <Palette size={18} />
        </button>
      )}
    </>
  );
};

export const Root = () => (
  <ThemeProvider>
    <RootContent />
  </ThemeProvider>
);
