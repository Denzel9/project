import {
  ChatBubbleOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVertOutlined,
  OpenInNew,
  Person,
  PersonAddOutlined,
  RocketLaunch,
  Schedule,
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
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  type User,
  type TaskStatus,
  getPhone,
  ContactType,
  getUserName,
  getContactLink,
  getContactIcon,
  TASK_STATUS_ENUM,
} from '@/entities';
import { ROUTES } from '@/shared';

import { AddExecutorDialog } from './AddExecutorDialog';

type ContactCardProps = {
  taskId: string;
  contact?: User;
  isMyPost?: boolean;
  withTitle?: boolean;
  status?: TaskStatus;
  isExecutorApprove?: boolean;
};

const cardSx = {
  width: '100%',
  height: 'fit-content',
  bgcolor: 'white',
  borderRadius: '32px',
  p: { xs: 2.5, md: 3 },
} as const;

type ContactRowProps = {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  label?: string;
};

const ContactRow = ({ href, icon, children, label }: ContactRowProps) => (
  <Box
    component={Link}
    to={href}
    target="_blank"
    sx={{
      display: 'flex',
      alignItems: label ? 'flex-start' : 'center',
      gap: 1.5,
      p: 1.5,
      borderRadius: '16px',
      bgcolor: 'secondary.light',
      color: 'inherit',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: 'info.light',
        color: 'primary.main',
      },
    }}
  >
    <Box sx={{ mt: label ? 0.25 : 0, color: 'primary.main', display: 'flex' }}>
      {icon}
    </Box>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      {label && (
        <Typography
          variant="caption"
          sx={{ display: 'block', mb: 0.25, color: 'info.main', fontWeight: 500 }}
        >
          {label}
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{ fontWeight: label ? 500 : 400, wordBreak: 'break-word' }}
      >
        {children}
      </Typography>
    </Box>
  </Box>
);

export const ContactCard = ({
  taskId,
  status,
  contact,
  withTitle = false,
  isMyPost = false,
  isExecutorApprove = false,
}: ContactCardProps) => {
  const [isOpenAddExecutorDialog, setIsOpenAddExecutorDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpenMoreContacts, setisOpenMoreContacts] = useState(false);

  const navigate = useNavigate();

  const roleLabel = isMyPost ? 'Исполнитель' : 'Заказчик';

  if (isExecutorApprove === null && contact?.id) {
    return (
      <Box sx={cardSx}>
        <Chip
          size="small"
          icon={<Schedule sx={{ fontSize: 16 }} />}
          label="Ожидает подтверждения"
          color="warning"
          sx={{ mb: 2.5, fontWeight: 500 }}
        />

        <Stack
          spacing={2}
          direction="row"
          sx={{ alignItems: 'center' }}
        >
          <Avatar
            src={contact.avatar || ''}
            sx={{
              width: 56,
              height: 56,
              border: '2px solid',
              borderColor: 'warning.light',
            }}
          >
            {getUserName(contact)?.charAt(0) ?? '?'}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.25 }}
            >
              {roleLabel}
            </Typography>

            <Link
              target="_blank"
              to={`${ROUTES.PROFILE}?userId=${contact.id}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: 'center',
                  transition: 'color 0.2s ease',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600 }}
                >
                  {getUserName(contact)}
                </Typography>
                <OpenInNew sx={{ fontSize: 16, opacity: 0.6 }} />
              </Stack>
            </Link>
          </Box>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ mt: 2.5 }}
        >
          <Button
            fullWidth
            size="small"
            variant="outlined"
            component={Link}
            to={`${ROUTES.PROFILE}?userId=${contact.id}`}
            target="_blank"
          >
            Профиль
          </Button>

          <Button
            fullWidth
            size="small"
            variant="contained"
            startIcon={<ChatBubbleOutlined />}
            onClick={() => navigate(`${ROUTES.CHAT}?recipientId=${contact.id}`)}
          >
            Написать
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box sx={cardSx}>
        {status !== TASK_STATUS_ENUM.CANCELLED ? (
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
              <PersonAddOutlined
                sx={{ fontSize: 32, color: 'primary.main' }}
              />
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

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <Typography
            variant="h6"
            onClick={() => navigate(`${ROUTES.PROFILE}?userId=${contact.id}`)}
            sx={{
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {getUserName(contact)}
          </Typography>

          <Tooltip title="Prime-аккаунт">
            <RocketLaunch
              sx={{ fontSize: 20, color: 'primary.main' }}
            />
          </Tooltip>
        </Stack>
      </Stack>

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
          to={`${ROUTES.CHAT}?recipientId=${contact.id}`}
        >
          В чат
        </Button>
      )}
    </Box>
  );
};
