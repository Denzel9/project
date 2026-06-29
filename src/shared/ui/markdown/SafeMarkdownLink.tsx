import type { ComponentProps } from 'react';

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

const isExternalHref = (href: string): boolean => /^https?:\/\//i.test(href);

export const SafeMarkdownLink = ({
  href,
  children,
  ...props
}: ComponentProps<'a'>) => {
  if (!href || !isSafeHref(href)) {
    return <span>{children}</span>;
  }

  const isExternal = isExternalHref(href);

  return (
    <a
      href={href}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      target={isExternal ? '_blank' : undefined}
      {...props}
    >
      {children}
    </a>
  );
};
