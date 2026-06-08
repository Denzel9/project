import { useEffect, useRef, useState } from 'react';

const getScrollTop = (target: HTMLElement | Window) =>
    target instanceof Window ? target.scrollY : target.scrollTop;

const getScrollableParent = (
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

export const useScroll = (
    threshold = 0,
) => {
    const ref = useRef<HTMLDivElement>(null);

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const scrollTarget = getScrollableParent(ref.current);

        const handleScroll = () => {
            setIsScrolled(getScrollTop(scrollTarget) > threshold);
        };

        handleScroll();
        scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

        return () => scrollTarget.removeEventListener('scroll', handleScroll);
    }, [threshold, ref]);

    return { isScrolled, ref };
};
