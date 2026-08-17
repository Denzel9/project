import { Box, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import {
  ContactType,
  getContactIcon,
  getContactLink,
  getPhone,
  type Contact,
} from '@/entities/user';
import { EmptyBlock } from '@/shared';

export const Contacts = ({ tabValue, contacts }: { tabValue: number; contacts: Contact[] }) => {
  if (!contacts.length) {
    return (
      <Box
        sx={{
          height: '100%',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderRadius: '24px',
          borderColor: 'divider',
          display: tabValue === 2 ? 'block' : 'none',
        }}
      >
        <EmptyBlock title="Нет данных" />
      </Box>
    );
  }

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        flex: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: '24px',
        p: { xs: 3, md: 4 },
        display: tabValue === 2 ? 'block' : 'none',
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
