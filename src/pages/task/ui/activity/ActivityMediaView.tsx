import { Link, Stack, Typography } from '@mui/material';

import { TaskActivityType } from '@/entities/task';

type ActivityMediaViewProps = {
  type: TaskActivityType.MEDIA_ADDED | TaskActivityType.MEDIA_REMOVED;
  from: string;
  to: string;
};

const isUrl = (value: string) => /^https?:\/\//i.test(value);

const MediaValue = ({ value, label }: { value: string; label: string }) => {
  if (!value?.trim() || value === '—') {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}: —
      </Typography>
    );
  }

  if (isUrl(value)) {
    return (
      <Typography variant="body2">
        {label}:{' '}
        <Link
          href={value}
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </Link>
      </Typography>
    );
  }

  return (
    <Typography variant="body2">
      {label}: {value}
    </Typography>
  );
};

export const ActivityMediaView = ({
  type,
  from,
  to,
}: ActivityMediaViewProps) => (
  <Stack
    spacing={1.5}
    sx={{ mt: 2 }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
    >
      {type === TaskActivityType.MEDIA_ADDED
        ? 'Файл добавлен в материалы задачи.'
        : 'Файл удалён из материалов задачи.'}
    </Typography>

    {type === TaskActivityType.MEDIA_ADDED ? (
      <MediaValue
        label="Файл"
        value={to !== '—' ? to : from}
      />
    ) : (
      <MediaValue
        label="Файл"
        value={from !== '—' ? from : to}
      />
    )}
  </Stack>
);
