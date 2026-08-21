import { Chat } from '@mui/icons-material';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

import {
  APPLICATION_STATUS_ENUM,
  useCreateApplicationMutation,
  useWithdrawApplicationMutation,
  type ApplicationStatus,
} from '@/entities/application';
import { USER_ROLE } from '@/entities/user';
import { useAuthStore, useRequireEmailConfirmed } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';
import { FavoriteButton } from '@/widgets';

import { ApplyDialog } from './ApplyDialog';
import { WithdrawDialog } from './WithdrawDialog';

type ActionProps = {
  postId: string;
  ownerId: string;
  isCompany?: boolean;
  isFavorite?: boolean;
  isApplied?: boolean;
  applicationId?: string;
  applicationStatus?: ApplicationStatus;
  removePostFromCollection?: (postId: string) => void;
};

export const Action = ({
  postId,
  ownerId,
  applicationId,
  applicationStatus,
  isCompany = false,
  isFavorite = false,
  removePostFromCollection,
  isApplied: isAppliedProp = false,
}: ActionProps) => {
  const role = useAuthStore(state => state.role);
  const isManager = role === USER_ROLE.MANAGER;

  const [isApplied, setIsApplied] = useState(isAppliedProp);
  const [currentApplicationId, setCurrentApplicationId] =
    useState(applicationId);
  const [currentApplicationStatus, setCurrentApplicationStatus] = useState<
    ApplicationStatus | undefined
  >(applicationStatus);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const { mutate: createApplication, isPending: isCreating } =
    useCreateApplicationMutation();
  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawApplicationMutation();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  useEffect(() => {
    setTimeout(() => {
      setIsApplied(isAppliedProp);
    }, 0);
  }, [isAppliedProp]);

  useEffect(() => {
    setTimeout(() => {
      setCurrentApplicationId(applicationId);
    }, 0);
  }, [applicationId]);

  useEffect(() => {
    setTimeout(() => {
      setCurrentApplicationStatus(applicationStatus);
    }, 0);
  }, [applicationStatus]);

  const isApplicationPending = isCreating || isWithdrawing;
  const canWithdraw = currentApplicationStatus === APPLICATION_STATUS_ENUM.NEW;

  const handleApply = (payload: { message: string }) => {
    if (!requireEmailConfirmed()) return;

    createApplication(
      {
        postId,
        message: payload.message,
      },
      {
        onSuccess: application => {
          setIsApplied(true);
          setCurrentApplicationId(application.id);
          setCurrentApplicationStatus(application.status);
          setIsApplyDialogOpen(false);
        },
      }
    );
  };

  const handleWithdraw = () => {
    if (!currentApplicationId || !canWithdraw || isApplicationPending) return;
    if (!requireEmailConfirmed()) return;

    withdrawApplication(currentApplicationId, {
      onSuccess: () => {
        setIsApplied(false);
        setCurrentApplicationId(undefined);
        setCurrentApplicationStatus(undefined);
        setIsWithdrawDialogOpen(false);
        removePostFromCollection?.(postId);
      },
    });
  };

  const handleOpenChat = () => {
    if (!requireEmailConfirmed()) return;
    window.open(
      `${ROUTES.CHATS}?recipientId=${encodeURIComponent(ownerId)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const mainButton = isManager ? (
    <Button
      size="small"
      variant="outlined"
      onClick={handleOpenChat}
    >
      Написать
    </Button>
  ) : isCompany ? (
    <Button
      variant="contained"
      disabled={isApplicationPending}
      onClick={() => {
        if (!requireEmailConfirmed()) return;
        setIsApplyDialogOpen(true);
      }}
    >
      Откликнуться
    </Button>
  ) : (
    <Button
      size="small"
      variant="outlined"
      onClick={handleOpenChat}
    >
      Написать
    </Button>
  );

  return (
    <>
      {!isApplied && !applicationStatus ? (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}>
          {mainButton}

          <FavoriteButton
            postId={postId}
            isFavorite={isFavorite}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}>
          {canWithdraw && (
            <Button
              color="error"
              variant="contained"
              onClick={() => setIsWithdrawDialogOpen(true)}
              sx={{ textTransform: 'none' }}
              disabled={isApplicationPending}
            >
              Отозвать отклик
            </Button>
          )}

          {!canWithdraw && isCompany && !isManager && (
            <Tooltip title="Повторный отклик недоступен. Вы можете написать заказчику в чат">
              <Button
                variant="contained"
                disabled
                sx={{ pointerEvents: 'auto !important' }}
              >
                Откликнуться
              </Button>
            </Tooltip>
          )}

          {applicationStatus === APPLICATION_STATUS_ENUM.ACCEPTED && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleOpenChat}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              В чат
            </Button>
          )}

          {applicationStatus === APPLICATION_STATUS_ENUM.ACCEPTED && (
            <IconButton
              onClick={handleOpenChat}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <Chat />
            </IconButton>
          )}

          <FavoriteButton
            postId={postId}
            isFavorite={isFavorite}
          />
        </Box>
      )}

      <ApplyDialog
        isPending={isCreating}
        onSubmit={handleApply}
        open={isApplyDialogOpen}
        onClose={() => setIsApplyDialogOpen(false)}
      />

      <WithdrawDialog
        isPending={isWithdrawing}
        onConfirm={handleWithdraw}
        open={isWithdrawDialogOpen}
        onClose={() => setIsWithdrawDialogOpen(false)}
      />
    </>
  );
};
