import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { Stack, Box, IconButton, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { RHFRichTextEditor, MarkdownContent } from '@/shared';

type DescriptionBlockProps = {
  isMe: boolean;
  isEdit: boolean;
  description: string;
  isOpenDescription: boolean;
  handleOpenDescription: () => void;
  setIsEdit: (isEdit: boolean) => void;
};

export const DescriptionBlock = ({
  isMe,
  isEdit,
  setIsEdit,
  description,
  isOpenDescription,
  handleOpenDescription,
}: DescriptionBlockProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  if (!isEdit && description) {
    <Stack
      spacing={1}
      direction="column"
    >
      <MarkdownContent
        content={description ?? ''}
        sx={{
          overflowY: isOpenDescription ? 'visible' : 'auto',
          maxHeight: isOpenDescription
            ? 'none'
            : description && description?.length > 1000
              ? '300px'
              : 'none',
        }}
      />

      {description && description?.length > 1000 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            color="primary"
            onClick={handleOpenDescription}
          >
            {isOpenDescription ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Box>
      )}
    </Stack>;
  }

  return isEdit ? (
    <RHFRichTextEditor
      maxLength={5000}
      control={control}
      name="description"
      minHeight={isOpenDescription ? 320 : 160}
    />
  ) : (
    <Typography
      onClick={() => isMe && setIsEdit(true)}
      sx={{
        color: errors.description ? 'error.main' : 'info.main',
        fontWeight: 500,
        transition: 'all 0.3s ease',
        cursor: isMe ? 'pointer' : 'default',
        ':hover': isMe
          ? {
              color: 'primary.main',
              textDecoration: 'underline',
            }
          : {},
      }}
    >
      {isMe ? 'Добавить описание' : 'Описание не задано'}
    </Typography>
  );
};
