import { Box, Stack, Typography } from '@mui/material';
import { formatDate } from 'date-fns';

import {
  GENDER_LABELS,
  MY_PARAMETERS,
  MY_PARAMETERS_LABELS,
  type Person,
} from '@/entities/user';
import { useAuthStore } from '@/features';
import { EmptyBlock, FormBlock } from '@/shared';

const formatPersonValue = (key: string, person?: Person) => {
  const value = person?.[key as keyof Person];

  if (key === MY_PARAMETERS.BIRTHDAY) {
    return formatDate(value || new Date(), 'dd.MM.yyyy');
  }

  if (key === MY_PARAMETERS.GENDER && typeof value === 'string') {
    return GENDER_LABELS[value] ?? value;
  }

  if (key === MY_PARAMETERS.HEIGHT && typeof value === 'string') {
    return `${value} см`;
  }

  if (key === MY_PARAMETERS.WEIGHT && typeof value === 'string') {
    return `${value} кг`;
  }

  return value;
};

export const AboutMe = ({
  tabValue,
  person,
  aboutMe,
}: {
  tabValue: number;
  person?: Person;
  aboutMe?: string;
}) => {
  const { role } = useAuthStore()

  const isLeastOneParameter = Object.entries(MY_PARAMETERS_LABELS).some(
    ([key]) => person?.[key as keyof Person]
  );

  if (!aboutMe && !isLeastOneParameter) {
    return (
      <Box
        sx={{
          height: '100%',
          bgcolor: 'white',
          border: '1px solid',
          borderRadius: '24px',
          borderColor: 'divider',
          display: tabValue === 1 ? 'block' : 'none',
        }}
      >
        <EmptyBlock title="Нет данных" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 3, md: 4 },
        borderRadius: '24px',
        display: tabValue === 1 ? 'block' : 'none',
      }}
    >
      {Boolean(aboutMe) && (
        <Typography
          variant="body1"
          sx={{
            mb: isLeastOneParameter ? 3 : 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {aboutMe}
        </Typography>
      )}

      {isLeastOneParameter && role !== 'COMPANY' && (
        <FormBlock>
          {Object.keys(MY_PARAMETERS_LABELS).map(key => (
            <Stack
              key={key}
              direction="column"
            >
              <Typography
                color="info"
                variant="body2"
              >
                {MY_PARAMETERS_LABELS[key as keyof typeof MY_PARAMETERS_LABELS]}
              </Typography>
              <Typography variant="body1">
                {formatPersonValue(key, person)}
              </Typography>
            </Stack>
          ))}
        </FormBlock>
      )}
    </Box>
  );
};
