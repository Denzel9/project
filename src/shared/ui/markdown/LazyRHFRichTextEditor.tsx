import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense, type JSX } from 'react';

import type { FieldPath, FieldValues } from 'react-hook-form';
import type { RHFRichTextEditorProps } from './RHFRichTextEditor';

const RHFRichTextEditorLazy = lazy(() => import('./RHFRichTextEditor')) as <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: RHFRichTextEditorProps<TFieldValues, TName>,
) => JSX.Element;

export const LazyRHFRichTextEditor = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: RHFRichTextEditorProps<TFieldValues, TName>,
) => (
  <Suspense
    fallback={
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: props.minHeight ?? 200,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CircularProgress size={24} />
      </Box>
    }
  >
    <RHFRichTextEditorLazy {...props} />
  </Suspense>
);

export default LazyRHFRichTextEditor;
