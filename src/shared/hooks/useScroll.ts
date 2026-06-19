import { useEffect, useRef, useState } from 'react';

import { getScrollableParent } from './getScrollableParent';

const getScrollTop = (target: HTMLElement | Window) =>
    target instanceof Window ? target.scrollY : target.scrollTop;

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
