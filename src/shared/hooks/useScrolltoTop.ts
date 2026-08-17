import { useEffect, type RefObject } from 'react';
import { useLocation } from 'react-router';

export const MAIN_SCROLL_SELECTOR = '[data-main-scroll]';

export const getMainScrollElement = () =>
  document.querySelector<HTMLElement>(MAIN_SCROLL_SELECTOR);

export const scrollMainToTop = (behavior: ScrollBehavior = 'smooth') => {
  const scrollEl = getMainScrollElement();

  if (scrollEl) {
    scrollEl.scrollTo({ top: 0, behavior });
    return;
  }

  window.scrollTo({ top: 0, behavior });
};

export const SETTINGS_SCROLL_SELECTOR = '[data-settings-scroll]';

export const scrollSettingsToTop = (behavior: ScrollBehavior = 'smooth') => {
  const scrollTargets = new Set<HTMLElement>();

  document
    .querySelectorAll<HTMLElement>(SETTINGS_SCROLL_SELECTOR)
    .forEach(element => scrollTargets.add(element));

  const mainScrollEl = getMainScrollElement();
  if (mainScrollEl) {
    scrollTargets.add(mainScrollEl);
  }

  scrollTargets.forEach(element => {
    element.scrollTo({ top: 0, behavior });
  });

  if (scrollTargets.size === 0) {
    window.scrollTo({ top: 0, behavior });
  }
};

export const useScrollToTop = (
  scrollRef?: RefObject<HTMLElement | null>,
) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollEl = scrollRef?.current;

    if (scrollEl) {
      scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    scrollMainToTop('smooth');
  }, [pathname, scrollRef]);
};
