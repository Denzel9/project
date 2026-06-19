export const getScrollableParent = (
  element: HTMLElement | null,
): HTMLElement | Window => {
  if (!element) return window;

  let parent = element.parentElement;

  while (parent) {
    const { overflowY } = getComputedStyle(parent);

    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay'
    ) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return window;
};
