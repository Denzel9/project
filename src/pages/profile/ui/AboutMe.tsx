import { Box, Stack, Typography } from '@mui/material';

import { MY_PARAMETERS_LABELS, type Person } from '@/entities/user';
import { FormBlock } from '@/shared';

import { UserCardItem } from './UserCardItem';

export const AboutMe = ({
  person,
  aboutMe,
}: {
  person?: Person;
  aboutMe?: string;
}) => {
  const isLeastOneParameter = Object.entries(MY_PARAMETERS_LABELS).some(
    ([key]) => person?.[key as keyof Person]
  );

  return (
    <Box sx={{ mt: 4 }}>
      <UserCardItem
        value={aboutMe || ''}
        isLoading={false}
      />

      {isLeastOneParameter && (
        <FormBlock>
          {Object.entries(MY_PARAMETERS_LABELS).map(([key]) => (
            <Stack direction="column">
              <Typography
                variant="body2"
                color="info"
              >
                {MY_PARAMETERS_LABELS[key as keyof typeof MY_PARAMETERS_LABELS]}
              </Typography>
              <Typography variant="body1">
                {person?.[key as keyof Person]}
              </Typography>
            </Stack>
          ))}
        </FormBlock>
      )}
    </Box>
  );
};
