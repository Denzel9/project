import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVertOutlined,
  RocketLaunch,
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
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  getContactIcon,
  ContactType,
  getContactLink,
  getPhone,
  getUserName,
  type User,
  type ApplicationStatus,
  APPLICATION_STATUS_ENUM,
} from '@/entities';
import { ROUTES } from '@/shared';

type ContactCardProps = {
  contact?: User;
  withTitle?: boolean;
  isMyPost?: boolean;
  status?: ApplicationStatus;
};

export const ContactCard = ({
  contact,
  withTitle = false,
  isMyPost = false,
}: ContactCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpenMoreContacts, setisOpenMoreContacts] = useState(false);

  const navigate = useNavigate();

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
        {withTitle && (
          <Stack
            spacing={1}
            direction="row"
            sx={{
              mb: 2,
              cursor: 'pointer',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
            onClick={() => navigate(`${ROUTES.PROFILE}?userId=${contact?.id}`)}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2 }}
            >
              {isMyPost ? 'Исполнитель' : 'Заказчик'}
            </Typography>
          </Stack>
        )}

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'end',
          }}
        >
          <IconButton onClick={event => setAnchorEl(event.currentTarget)}>
            <MoreVertOutlined />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => navigate(`${ROUTES.PROFILE}?userId=${contact?.id}`)}
          >
            <Typography>Перейти к профилю</Typography>
          </MenuItem>
        </Menu>
      </Stack>

      <Avatar
        src={contact?.avatar || ''}
        sx={{ width: '88px', height: '88px' }}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', mt: 4 }}
      >
        <Typography variant="h6">{getUserName(contact)}</Typography>

        <Tooltip title="Это - Prime-аккаунт">
          <RocketLaunch color="primary" />
        </Tooltip>
      </Stack>

      {contact?.phone && (
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
      )}

      {contact?.email && (
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
      )}

      {Boolean(contact?.contacts?.length) && (
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
      )}

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

      {status === APPLICATION_STATUS_ENUM.ACCEPTED && (
        <Button
          sx={{ mt: 4 }}
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
