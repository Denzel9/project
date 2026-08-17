import { DeleteOutlined } from '@mui/icons-material';
import {
  Avatar,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  MemberRole,
  ProfileMemberKindLabels,
  type ProfileMember,
} from '@/entities/workspace-member';
import { useAuthStore } from '@/features/auth';

type MembersListProps = {
  members: ProfileMember[];
  onDelete: (member: ProfileMember) => void;
  canDelete?: boolean;
};

const getInitials = (name: string) =>
  name
    ?.split(' ')
    ?.map(part => part[0])
    ?.join('')
    ?.slice(0, 2)
    ?.toUpperCase();

const getMemberRoleLabel = (member: ProfileMember) => {
  if (member.kind === 'OWNER' || member.kind === 'MANAGER') {
    return ProfileMemberKindLabels[member.kind];
  }

  return member.membershipRole === MemberRole.OWNER
    ? ProfileMemberKindLabels.OWNER
    : ProfileMemberKindLabels.MANAGER;
};

export const MembersList = ({
  members,
  onDelete,
  canDelete = false,
}: MembersListProps) => {
  const accountId = useAuthStore(state => state.accountId);

  if (!members.length) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ py: 4, textAlign: 'center' }}
      >
        Участников пока нет. Добавьте первого участника.
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {members.map(member => {
        const isCurrentAccount = member.accountId === accountId;

        return (
          <ListItem
            key={member.membershipId}
            disablePadding
            sx={{
              mb: 1,
              px: 2,
              py: 1.5,
              borderRadius: '16px',
              '&:hover': { bgcolor: 'secondary.light' },
              transition: 'all 0.3s ease',
              backgroundColor: isCurrentAccount ? 'info.light' : 'transparent',
            }}
            secondaryAction={
              member.membershipRole !== MemberRole.OWNER && (
                <Tooltip
                  title={
                    canDelete
                      ? ''
                      : 'Отзывать доступ может только владелец профиля'
                  }
                  disableHoverListener={canDelete}
                >
                  <span>
                    <IconButton
                      edge="end"
                      color="error"
                      disabled={!canDelete}
                      aria-label={`Remove ${member.displayName}`}
                      onClick={() => onDelete(member)}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </span>
                </Tooltip>
              )
            }
          >
            <ListItemAvatar>
              <Avatar>{getInitials(member.displayName || '')}</Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}
                >
                  {member.displayName}

                  {isCurrentAccount && (
                    <Chip
                      label="Это вы"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              }
              secondary={
                <Stack
                  direction="row"
                  spacing={1}
                  divider={
                    <Divider
                      orientation="vertical"
                      flexItem
                    />
                  }
                >
                  <Typography variant="body2">{member.email}</Typography>

                  <Typography
                    variant="body2"
                    color="primary"
                  >
                    {getMemberRoleLabel(member)}
                  </Typography>
                </Stack>
              }
              slotProps={{
                primary: { sx: { fontWeight: 500 } },
                secondary: { sx: { color: 'text.secondary' } },
              }}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
