import { Button, Stack } from '@mui/material';

import { useProfileStore } from '../model/store';

import type { MouseEvent } from 'react';

type ActionButtonProps = {
  handleCancelEdit: () => void;
  handleEdit: (e: MouseEvent<HTMLButtonElement>) => void;
};

export const ActionButton = ({
  handleCancelEdit,
  handleEdit,
}: ActionButtonProps) => {
  const { isEdit, isMe } = useProfileStore();

  return !isMe ? (
    <Button variant="contained">Подписаться</Button>
  ) : (
    <Stack
      direction="row"
      spacing={2}
    >
      {isEdit && (
        <Button
          size="small"
          color="error"
          sx={{ px: 2 }}
          onClick={handleCancelEdit}
        >
          Отменить
        </Button>
      )}

      {isEdit ? (
        <Button
          size="small"
          type="submit"
          sx={{ px: 2 }}
        >
          Сохранить
        </Button>
      ) : (
        <Button
          size="small"
          sx={{ px: 2 }}
          onClick={e => handleEdit(e)}
        >
          Редактировать
        </Button>
      )}
    </Stack>
  );
};
