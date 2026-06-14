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
  Typography,
} from '@mui/material';

import {
  MemberRole,
  MemberRoleLabels,
  type WorkspaceMember,
} from '@/entities/workspace-member';
import { useAuthStore } from '@/features/auth';

type MembersListProps = {
  members: WorkspaceMember[];
  onDelete: (member: WorkspaceMember) => void;
};

const getInitials = (name: string) =>
  name
    ?.split(' ')
    ?.map(part => part[0])
    ?.join('')
    ?.slice(0, 2)
    ?.toUpperCase();

export const MembersList = ({ members, onDelete }: MembersListProps) => {
  const { id } = useAuthStore();

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
      {members?.map(member => (
        <ListItem
          key={member.id}
          disablePadding
          sx={{
            mb: 1,
            px: 2,
            py: 1.5,
            borderRadius: '16px',
            '&:hover': { bgcolor: 'secondary.light' },
            transition: 'all 0.3s ease',
            backgroundColor:
              member.userId === id ? 'info.light' : 'transparent',
          }}
          secondaryAction={
            member.membershipRole !== MemberRole.OWNER && (
              <IconButton
                edge="end"
                color="error"
                aria-label={`Remove ${member.displayName}`}
                onClick={() => onDelete(member)}
              >
                <DeleteOutlined />
              </IconButton>
            )
          }
        >
          <ListItemAvatar>
            <Avatar src={member.avatar}>
              {getInitials(member.displayName || '')}
            </Avatar>
          </ListItemAvatar>

          <ListItemText
            primary={
              <Typography
                variant="body1"
                sx={{ fontWeight: 500 }}
              >
                {member.displayName}

                {member.membershipRole === MemberRole.OWNER && (
                  <Chip
                    label={'Это вы'}
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
                <Typography variant="body2">{member?.email}</Typography>

                <Typography
                  variant="body2"
                  color="primary"
                >
                  {
                    MemberRoleLabels[
                      member?.membershipRole || MemberRole.VIEWER
                    ]
                  }
                </Typography>
              </Stack>
            }
            slotProps={{
              primary: { sx: { fontWeight: 500 } },
              secondary: { sx: { color: 'text.secondary' } },
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};
