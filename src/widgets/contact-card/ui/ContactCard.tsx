import {
  ChatBubbleOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVertOutlined,
  Person,
  PersonAddOutlined,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  type User,
  type TaskStatus,
  getPhone,
  ContactType,
  getUserName,
  UserDisplayName,
  getContactLink,
  getContactIcon,
  TASK_STATUS_ENUM,
} from '@/entities';
import { ROUTES } from '@/shared';

import { AddExecutorDialog } from './AddExecutorDialog';
import { ContactRow } from './ContactRow';

type ContactCardProps = {
  taskId: string;
  contact?: User | Partial<User>;
  isContactLoading?: boolean;
  isMyPost?: boolean;
  withTitle?: boolean;
  status?: TaskStatus;
  isExecutorApprove?: boolean | null;
  roleLabel?: string;
};

const cardSx = {
  width: '100%',
  height: 'fit-content',
  bgcolor: 'background.paper',
  borderRadius: '32px',
  p: 2,
  border: '1px solid',
  borderColor: 'divider',
} as const;

export const ContactCard = ({
  taskId,
  status,
  contact,
  withTitle = false,
  isMyPost = false,
  isContactLoading = false,
  isExecutorApprove,
  roleLabel: roleLabelProp,
}: ContactCardProps) => {
  const [isOpenAddExecutorDialog, setIsOpenAddExecutorDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpenMoreContacts, setisOpenMoreContacts] = useState(false);

  const navigate = useNavigate();

  const roleLabel =
    roleLabelProp ?? (isMyPost ? 'Исполнитель' : 'Заказчик');
  const isAwaitingExecutorApproval = isExecutorApprove === null && isMyPost;
  const isExecutorRejected = isExecutorApprove === false && isMyPost;

  if (!contact) {
    if (isContactLoading) {
      return (
        <Box sx={cardSx}>
          <Stack
            spacing={1.5}
            sx={{ alignItems: 'center', py: 3 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Загрузка контакта…
            </Typography>
          </Stack>
        </Box>
      );
    }

    return (
      <Box sx={cardSx}>
        {status !== TASK_STATUS_ENUM.ANNULLED ? (
          <Stack
            spacing={2}
            sx={{ alignItems: 'center', textAlign: 'center', py: 1 }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '20px',
                bgcolor: 'info.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonAddOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                Исполнитель не назначен
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Выберите исполнителя для этой задачи
              </Typography>
            </Box>

            <Button
              fullWidth
              color="primary"
              variant="contained"
              onClick={() => setIsOpenAddExecutorDialog(true)}
            >
              Назначить исполнителя
            </Button>
          </Stack>
        ) : (
          <Stack
            spacing={1.5}
            direction="row"
            sx={{
              alignItems: 'center',
              p: 1.5,
              borderRadius: '16px',
              bgcolor: 'secondary.light',
            }}
          >
            <Person sx={{ color: 'info.main' }} />
            <Typography variant="body2">Исполнитель не был назначен</Typography>
          </Stack>
        )}

        <AddExecutorDialog
          taskId={taskId}
          isOpen={isOpenAddExecutorDialog}
          onClose={() => setIsOpenAddExecutorDialog(false)}
        />
      </Box>
    );
  }

  return (
    <Box sx={cardSx}>
      <Stack
        direction="row"
        sx={{ mb: 2.5, alignItems: 'center', justifyContent: 'space-between' }}
      >
        {withTitle ? (
          <Chip
            size="small"
            label={roleLabel}
            sx={{
              fontWeight: 600,
              bgcolor: 'info.light',
              color: 'primary.main',
            }}
          />
        ) : (
          <Box />
        )}

        <IconButton
          size="small"
          aria-label="Действия с контактом"
          onClick={event => setAnchorEl(event.currentTarget)}
        >
          <MoreVertOutlined fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate(`${ROUTES.PROFILE}?userId=${contact.id}`);
            }}
          >
            Перейти к профилю
          </MenuItem>
        </Menu>
      </Stack>

      <Stack
        spacing={1.5}
        sx={{ alignItems: 'center', textAlign: 'center', mb: 2.5 }}
      >
        <Avatar
          src={contact.avatar || ''}
          onClick={() => navigate(`${ROUTES.PROFILE}?userId=${contact.id}`)}
          sx={{
            width: 88,
            height: 88,
            cursor: 'pointer',
            border: '3px solid',
            borderColor: 'info.light',
            transition: 'border-color 0.2s ease',
            '&:hover': { borderColor: 'primary.light' },
          }}
        >
          {getUserName(contact)?.charAt(0) ?? '?'}
        </Avatar>

        <Box
          onClick={() => navigate(`${ROUTES.PROFILE}?userId=${contact.id}`)}
          sx={{ cursor: 'pointer' }}
        >
          <UserDisplayName
            user={contact}
            variant="subtitle1"
          />
        </Box>
      </Stack>

      {isAwaitingExecutorApproval && (
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            borderRadius: '16px',
            bgcolor: 'info.light',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 500 }}
          >
            Ожидается подтверждение от исполнителя
          </Typography>
        </Box>
      )}

      {isExecutorRejected && (
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            borderRadius: '16px',
            bgcolor: 'error.light',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'white', fontWeight: 500 }}
          >
            Исполнитель отказался от задачи
          </Typography>
        </Box>
      )}

      <Stack spacing={1}>
        {contact.phone && (
          <ContactRow
            href={getContactLink(ContactType.PHONE, contact.phone)}
            icon={getContactIcon(ContactType.PHONE)}
          >
            {getPhone(contact.phone)}
          </ContactRow>
        )}

        {contact.email && (
          <ContactRow
            href={getContactLink(ContactType.EMAIL, contact.email)}
            icon={getContactIcon(ContactType.EMAIL)}
          >
            {contact.email}
          </ContactRow>
        )}
      </Stack>

      {Boolean(contact.contacts?.length) && (
        <Button
          size="small"
          sx={{ mt: 1.5, px: 1.5 }}
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
          spacing={1}
          sx={{ mt: 1.5 }}
        >
          {contact.contacts?.map(field => (
            <ContactRow
              key={field.value}
              href={getContactLink(field.type, field.value)}
              icon={getContactIcon(field.type as ContactType)}
              label={field.label}
            >
              {field.type === ContactType.PHONE
                ? getPhone(field.value)
                : field.value}
            </ContactRow>
          ))}
        </Stack>
      )}

      {isMyPost && (
        <Button
          fullWidth
          sx={{ mt: 2.5 }}
          component={Link}
          variant="contained"
          startIcon={<ChatBubbleOutlined />}
          to={`${ROUTES.CHATS}?recipientId=${contact.id}`}
        >
          В чат
        </Button>
      )}
    </Box>
  );
};
