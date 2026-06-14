import { Chat } from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  canWithdrawApplication,
  useCreateApplicationMutation,
  useWithdrawApplicationMutation,
  type ApplicationStatus,
} from '@/entities/application';
import { ROUTES } from '@/shared/config/routes';
import { FavoriteButton } from '@/widgets';

import { ApplyDialog } from './ApplyDialog';
import { WithdrawDialog } from './WithdrawDialog';

type ActionProps = {
  postId: string;
  ownerId: string;
  isFavorite?: boolean;
  isApplied?: boolean;
  applicationId?: string;
  applicationStatus?: ApplicationStatus;
};

export const Action = ({
  postId,
  ownerId,
  isFavorite = false,
  isApplied: isAppliedProp = false,
  applicationId,
  applicationStatus,
}: ActionProps) => {
  const navigate = useNavigate();

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
  const canWithdraw =
    Boolean(currentApplicationId) &&
    Boolean(currentApplicationStatus) &&
    currentApplicationStatus &&
    canWithdrawApplication(currentApplicationStatus);

  const handleApply = (message: string) => {
    createApplication(
      { postId, message },
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

    withdrawApplication(currentApplicationId, {
      onSuccess: () => {
        setIsApplied(false);
        setCurrentApplicationId(undefined);
        setCurrentApplicationStatus(undefined);
        setIsWithdrawDialogOpen(false);
      },
    });
  };

  const handleOpenChat = () => {
    navigate(`${ROUTES.CHAT}?recipientId=${ownerId}`);
  };

  return (
    <>
      {!isApplied ? (
        <Box
          sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}
          onClick={e => e.preventDefault()}
        >
          <Button
            variant="contained"
            disabled={isApplicationPending}
            onClick={() => setIsApplyDialogOpen(true)}
          >
            Откликнуться
          </Button>

          <FavoriteButton
            postId={postId}
            isFavorite={isFavorite}
          />
        </Box>
      ) : (
        <Box
          sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}
          onClick={e => e.preventDefault()}
        >
          {canWithdraw && (
            <Button
              color="error"
              variant="contained"
              onClick={() => setIsWithdrawDialogOpen(true)}
              sx={{ textTransform: 'none' }}
              disabled={isApplicationPending}
            >
              Отменить отклик
            </Button>
          )}

          <Button
            sx={{ display: { xs: 'none', md: 'block' } }}
            size="small"
            variant="contained"
            color="secondary"
            onClick={handleOpenChat}
          >
            В чат
          </Button>

          <IconButton
            onClick={handleOpenChat}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <Chat />
          </IconButton>

          <FavoriteButton
            postId={postId}
            isFavorite={isFavorite}
          />
        </Box>
      )}

      <ApplyDialog
        open={isApplyDialogOpen}
        isPending={isCreating}
        onClose={() => setIsApplyDialogOpen(false)}
        onSubmit={handleApply}
      />

      <WithdrawDialog
        open={isWithdrawDialogOpen}
        isPending={isWithdrawing}
        onClose={() => setIsWithdrawDialogOpen(false)}
        onConfirm={handleWithdraw}
      />
    </>
  );
};
