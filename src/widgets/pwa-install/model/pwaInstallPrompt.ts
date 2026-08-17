const STORAGE_KEY = 'nikssens-pwa-install-dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;
const subscribers = new Set<() => void>();

const notify = () => {
  subscribers.forEach(listener => listener());
};

export const isPwaStandalone = () => {
  if (typeof window === 'undefined') return false;

  const nav = window.navigator as Navigator & { standalone?: boolean };

  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  );
};

export const isIosDevice = () => {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent;
  const isTouchMac =
    window.navigator.platform === 'MacIntel' &&
    window.navigator.maxTouchPoints > 1;

  return /iPhone|iPad|iPod/i.test(ua) || isTouchMac;
};

export const isPwaInstallDismissed = () => {
  if (typeof window === 'undefined') return true;

  return localStorage.getItem(STORAGE_KEY) === '1';
};

export const dismissPwaInstall = () => {
  localStorage.setItem(STORAGE_KEY, '1');
  deferredPrompt = null;
  notify();
};

export const hasPwaInstallPrompt = () => Boolean(deferredPrompt);

export const promptPwaInstall = async () => {
  if (!deferredPrompt) return false;

  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  notify();

  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;

  if (outcome === 'accepted') {
    dismissPwaInstall();
    return true;
  }

  return false;
};

export const subscribePwaInstallPrompt = (listener: () => void) => {
  subscribers.add(listener);
  listener();

  return () => {
    subscribers.delete(listener);
  };
};

export const initPwaInstallPrompt = () => {
  if (initialized || typeof window === 'undefined') return;

  initialized = true;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    dismissPwaInstall();
  });
};
