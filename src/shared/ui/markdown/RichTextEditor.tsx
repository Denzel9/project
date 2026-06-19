import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Title,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  FormHelperText,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Extension } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';

import { BASE_COLOR } from '@/app/theme/theme';

const EnterAsLineBreak = Extension.create({
  name: 'enterAsLineBreak',
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (
          editor.isActive('bulletList') ||
          editor.isActive('orderedList') ||
          editor.isActive('codeBlock')
        ) {
          return false;
        }

        return editor.commands.setHardBreak();
      },
      'Shift-Enter': ({ editor }) => editor.commands.splitBlock(),
    };
  },
});

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  minHeight?: number;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

export const RichTextEditor = ({
  value,
  onChange,
  maxLength,
  minHeight = 160,
  label,
  error = false,
  helperText,
  disabled = false,
}: RichTextEditorProps) => {
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      EnterAsLineBreak,
      Placeholder.configure({ placeholder: 'Введите описание…' }),
      Markdown.configure({
        markedOptions: {
          gfm: true,
          breaks: true,
        },
      }),
    ],
    content: value || '',
    contentType: 'markdown',
    editable: !disabled,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: currentEditor }) => {
      isInternalUpdate.current = true;
      onChange(currentEditor.getMarkdown());
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const currentMarkdown = editor.getMarkdown();

    if (value !== currentMarkdown) {
      editor.commands.setContent(value || '', { contentType: 'markdown' });
    }
  }, [editor, value]);

  const markdownLength = editor?.getMarkdown().length ?? value.length;

  const runCommand = (command: () => boolean) => {
    if (!editor) return;

    command();
    editor.commands.focus();
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          color={error ? 'error' : 'text.secondary'}
          sx={{ mb: 1 }}
        >
          {label}
        </Typography>
      )}

      <Box
        sx={{
          borderRadius: '16px',
          border: theme =>
            `1px solid ${error ? theme.palette.error.main : theme.palette.secondary.main}`,
          overflow: 'hidden',
          transition: 'border-color 0.2s ease',
          '&:focus-within': {
            borderColor: error ? 'error.main' : BASE_COLOR,
            borderWidth: '2px',
          },
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          '& .ProseMirror': {
            minHeight,
            outline: 'none',
            px: 1.5,
            py: 1,
            fontSize: '1rem',
            fontFamily: 'Roboto, sans-serif',
            lineHeight: 1.5,
            '& p.is-editor-empty:first-child::before': {
              color: 'text.disabled',
              content: 'attr(data-placeholder)',
              float: 'left',
              height: 0,
              pointerEvents: 'none',
            },
            '& p': { m: 0, mb: 0.5 },
            '& ul, & ol': { pl: 2.5, my: 0.5 },
            '& h2': { fontSize: '1.125rem', fontWeight: 600, my: 0.5 },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            px: 1,
            py: 0.5,
            flexWrap: 'wrap',
            bgcolor: 'secondary.light',
          }}
        >
          <IconButton
            size="small"
            disabled={!editor}
            color={editor?.isActive('bold') ? 'primary' : 'default'}
            onClick={() =>
              runCommand(() => editor!.chain().focus().toggleBold().run())
            }
          >
            <FormatBold fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            disabled={!editor}
            color={editor?.isActive('italic') ? 'primary' : 'default'}
            onClick={() =>
              runCommand(() => editor!.chain().focus().toggleItalic().run())
            }
          >
            <FormatItalic fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            disabled={!editor}
            color={
              editor?.isActive('heading', { level: 2 }) ? 'primary' : 'default'
            }
            onClick={() =>
              runCommand(() =>
                editor!.chain().focus().toggleHeading({ level: 2 }).run()
              )
            }
          >
            <Title fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            disabled={!editor}
            color={editor?.isActive('bulletList') ? 'primary' : 'default'}
            onClick={() =>
              runCommand(() => editor!.chain().focus().toggleBulletList().run())
            }
          >
            <FormatListBulleted fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            disabled={!editor}
            color={editor?.isActive('orderedList') ? 'primary' : 'default'}
            onClick={() =>
              runCommand(() =>
                editor!.chain().focus().toggleOrderedList().run()
              )
            }
          >
            <FormatListNumbered fontSize="small" />
          </IconButton>
        </Stack>

        <Divider />

        <EditorContent editor={editor} />

        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: theme => `1px solid ${theme.palette.divider}`,
          }}
        >
          {maxLength != null && (
            <Typography
              variant="caption"
              color={
                markdownLength > maxLength ? 'error.main' : 'text.secondary'
              }
            >
              {markdownLength} / {maxLength}
            </Typography>
          )}
        </Box>
      </Box>

      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

export default RichTextEditor;
