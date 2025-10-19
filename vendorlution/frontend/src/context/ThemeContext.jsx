// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("reducedMotion") === "true");

  // Persist + set attribute for CSS
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme); // <html data-theme="dark|light">
    // Broadcast (optional)
    window.dispatchEvent(new CustomEvent("vendorlution:settings:theme", { detail: { theme } }));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("reducedMotion", String(reducedMotion));
    window.dispatchEvent(new CustomEvent("vendorlution:settings:reducedMotion", { detail: { reducedMotion } }));
  }, [reducedMotion]);

  const value = useMemo(() => ({ theme, setTheme, reducedMotion, setReducedMotion }), [theme, reducedMotion]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}