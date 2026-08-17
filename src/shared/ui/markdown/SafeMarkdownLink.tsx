import type { ComponentProps } from 'react';

import { ExternalLinkAnchor } from '@/shared/ui/links';

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

const isSafeHref = (href: string): boolean => {
  const trimmed = href.trim();

  if (trimmed.startsWith('//')) {
    return false;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return SAFE_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
};

export const SafeMarkdownLink = ({
  href,
  children,
  ...props
}: ComponentProps<'a'>) => {
  if (!href || !isSafeHref(href)) {
    return <span>{children}</span>;
  }

  if (href.startsWith('mailto:')) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <ExternalLinkAnchor href={href} {...props}>
      {children}
    </ExternalLinkAnchor>
  );
};
