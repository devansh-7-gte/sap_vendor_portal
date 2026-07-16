'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react';

const ThemeContext = createContext(undefined);

const STORAGE_KEY = 'vc-theme';
const EVENT = 'vc-themechange';

// ── External store: the DOM class on <html> is the single source of truth ──
// The no-FOUC inline script sets it before hydration; we read/subscribe to it
// so React stays in sync without ever calling setState inside an effect.
function subscribe(callback) {
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      applyClass(e.newValue);
      callback();
    }
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function getServerSnapshot() {
  return 'light';
}

function applyClass(next) {
  const root = document.documentElement;
  root.classList.toggle('dark', next === 'dark');
  root.style.colorScheme = next;
}

export function ThemeProvider({ children }) {
  // `mounted` distinguishes the server 'light' snapshot from the real client one.
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const setTheme = useCallback((next) => {
    applyClass(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode) — theme still applies for the session */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = getSnapshot() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
