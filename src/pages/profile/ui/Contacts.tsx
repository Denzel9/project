import { Box, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import { ContactType, getPhone, type Contact } from '@/entities/user';

import { getContactIcon, getContactLink } from '../model/utils/helpers';

export const Contacts = ({ contacts }: { contacts: Contact[] }) => {
  return (
    <Box>
      <Stack
        direction="column"
        spacing={2}
        sx={{ mt: { xs: 0, md: 4 }, px: { xs: 3, md: 0 } }}
      >
        {contacts?.map(field => {
          return (
            <Stack
              key={field.value}
              direction="row"
              sx={{ alignItems: 'center' }}
              spacing={2}
            >
              {getContactIcon(field.type as ContactType)}
              <Typography
                variant="body1"
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'primary.main',
                  },
                }}
              >
                <Link
                  target="_blank"
                  to={getContactLink(field.type, field.value)}
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  {field.type === ContactType.PHONE
                    ? getPhone(field.value)
                    : field.value}
                </Link>
              </Typography>
              <Typography
                variant="body2"
                color="info"
              >
                {field.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};
