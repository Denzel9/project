import { Box, type SxProps, type Theme } from '@mui/material';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { SafeMarkdownLink } from './SafeMarkdownLink';

type MarkdownContentProps = {
  content: string;
  sx?: SxProps<Theme>;
};

const markdownComponents: Components = {
  a: SafeMarkdownLink,
};

const markdownSx: SxProps<Theme> = {
  fontSize: '1rem',
  fontFamily: 'Roboto, sans-serif',
  lineHeight: 1.5,
  '& p': {
    m: 0,
    mb: 0.5,
    '&:last-child': { mb: 0 },
  },
  '& ul, & ol': {
    m: 0,
    mb: 0.5,
    pl: 2.5,
  },
  '& li': {
    mb: 0.25,
  },
  '& strong': {
    fontWeight: 600,
    color: 'text.primary',
  },
  '& h2': {
    m: 0,
    mb: 0.5,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'text.primary',
  },
  '& a': {
    color: 'primary.main',
  },
};

export const MarkdownContent = ({ content, sx }: MarkdownContentProps) => (
  <Box sx={[markdownSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[[rehypeSanitize, defaultSchema]]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  </Box>
);

export default MarkdownContent;
