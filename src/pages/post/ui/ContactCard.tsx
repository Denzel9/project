import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVertOutlined,
} from '@mui/icons-material';
import {
  Box,
  Stack,
  Avatar,
  IconButton,
  Typography,
  Button,
  FormControl,
  FormLabel,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router';

import {
  getContactIcon,
  ContactType,
  getContactLink,
  getPhone,
  type User,
} from '@/entities/user';
import { ROUTES } from '@/shared';

export const ContactCard = ({
  contact,
  isMyPost,
}: {
  contact?: User;
  isMyPost: boolean;
}) => {
  const [isOpenMoreContacts, setisOpenMoreContacts] = useState(false);

  return (
    <Box
      sx={{
        width: '100%',
        height: 'fit-content',
        p: { xs: 3, md: 4 },
        bgcolor: 'white',
        borderRadius: '32px',
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'start', justifyContent: 'space-between' }}
      >
        <Avatar
          src={contact?.avatar || ''}
          sx={{ width: '88px', height: '88px' }}
        />

        <IconButton>
          <MoreVertOutlined />
        </IconButton>
      </Stack>

      <Typography sx={{ mt: 2 }}>
        {contact?.creatorProfile?.name} {contact?.creatorProfile?.lastName}
      </Typography>

      <Stack
        spacing={2}
        direction="row"
        sx={{ alignItems: 'center', mt: 2 }}
      >
        {getContactIcon(ContactType.PHONE)}
        <Typography
          variant="body1"
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          <Link
            target="_blank"
            to={getContactLink(ContactType.PHONE, contact?.phone || '')}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {getPhone(contact?.phone || '')}
          </Link>
        </Typography>
      </Stack>

      <Stack
        spacing={2}
        direction="row"
        sx={{ alignItems: 'center', mt: 2 }}
      >
        {getContactIcon(ContactType.EMAIL)}
        <Typography
          variant="body1"
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          <Link
            target="_blank"
            to={getContactLink(ContactType.EMAIL, contact?.email || '')}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {contact?.email || ''}
          </Link>
        </Typography>
      </Stack>

      <Button
        size="small"
        sx={{ px: 2, mt: 2 }}
        endIcon={
          isOpenMoreContacts ? <KeyboardArrowUp /> : <KeyboardArrowDown />
        }
        onClick={() => setisOpenMoreContacts(!isOpenMoreContacts)}
      >
        Дополнительные контакты
      </Button>

      {isOpenMoreContacts && (
        <Stack
          direction="column"
          spacing={2}
          sx={{ mt: 2 }}
        >
          {contact?.contacts?.map(field => {
            return (
              <Stack
                spacing={2}
                direction="row"
                key={field.value}
                sx={{ alignItems: field.label ? 'start' : 'center' }}
              >
                {getContactIcon(field.type as ContactType)}
                <FormControl fullWidth>
                  <FormLabel
                    sx={{
                      mb: 0.5,
                      fontWeight: 500,
                      fontSize: '14px',
                      opacity: 0.5,
                    }}
                  >
                    {field.label}
                  </FormLabel>
                  <Typography
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        cursor: 'pointer',
                        color: 'primary.main',
                        textDecoration: 'underline',
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
                </FormControl>
              </Stack>
            );
          })}
        </Stack>
      )}

      {!isMyPost && (
        <Button
          sx={{ mt: 2 }}
          component={Link}
          variant="outlined"
          to={`${ROUTES.CHAT}?recipientId=${contact?.id}`}
        >
          В чат
        </Button>
      )}
    </Box>
  );
};
