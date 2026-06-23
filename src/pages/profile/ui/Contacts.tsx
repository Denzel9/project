import { Box, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import {
  ContactType,
  getContactIcon,
  getContactLink,
  getPhone,
  type Contact,
} from '@/entities/user';

export const Contacts = ({ contacts }: { contacts: Contact[] }) => {
  if(!contacts.length) {
    return <Box sx={{
      bgcolor: 'white',
      p: { xs: 3, md: 4 },
      borderRadius: '32px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Typography sx={{ fontSize: {xs: '24px', md: '34px'}, opacity: 0.3 }} color="info">
        Нет данных
      </Typography>
    </Box>;
  }

  return (
      <Stack
        direction="column"
        spacing={2}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '32px',
          bgcolor: 'white',
          height: '100%',
        }}
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
  );
};
