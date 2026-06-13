import { Favorite, FavoriteBorderOutlined } from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  canWithdrawApplication,
  useCreateApplicationMutation,
  useWithdrawApplicationMutation,
  type ApplicationStatus,
} from '@/entities/application';
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from '@/entities/favorite';
import { ROUTES } from '@/shared/config/routes';

import { ApplyDialog } from './ApplyDialog';

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
  isFavorite: isFavoriteProp = false,
  isApplied: isAppliedProp = false,
  applicationId,
  applicationStatus,
}: ActionProps) => {
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(isFavoriteProp);
  const [isApplied, setIsApplied] = useState(isAppliedProp);
  const [currentApplicationId, setCurrentApplicationId] = useState(applicationId);
  const [currentApplicationStatus, setCurrentApplicationStatus] =
    useState<ApplicationStatus | undefined>(applicationStatus);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const { mutate: addFavorite, isPending: isAdding } = useAddFavoriteMutation();
  const { mutate: removeFavorite, isPending: isRemoving } =
    useRemoveFavoriteMutation();
  const { mutate: createApplication, isPending: isCreating } =
    useCreateApplicationMutation();
  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawApplicationMutation();

  useEffect(() => {
    setIsFavorite(isFavoriteProp);
  }, [isFavoriteProp]);

  useEffect(() => {
    setIsApplied(isAppliedProp);
  }, [isAppliedProp]);

  useEffect(() => {
    setCurrentApplicationId(applicationId);
  }, [applicationId]);

  useEffect(() => {
    setCurrentApplicationStatus(applicationStatus);
  }, [applicationStatus]);

  const isFavoritePending = isAdding || isRemoving;
  const isApplicationPending = isCreating || isWithdrawing;
  const canWithdraw =
    Boolean(currentApplicationId) &&
    Boolean(currentApplicationStatus) &&
    canWithdrawApplication(currentApplicationStatus);

  const handleToggleFavorite = () => {
    if (isFavoritePending) return;

    if (isFavorite) {
      removeFavorite(postId, {
        onSuccess: () => setIsFavorite(false),
      });
    } else {
      addFavorite(
        { postId },
        {
          onSuccess: () => setIsFavorite(true),
        },
      );
    }
  };

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
      },
    );
  };

  const handleWithdraw = () => {
    if (!currentApplicationId || !canWithdraw || isApplicationPending) return;

    withdrawApplication(currentApplicationId, {
      onSuccess: () => {
        setIsApplied(false);
        setCurrentApplicationId(undefined);
        setCurrentApplicationStatus(undefined);
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

          <IconButton
            disabled={isFavoritePending}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? (
              <Favorite color="primary" />
            ) : (
              <FavoriteBorderOutlined />
            )}
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 4 }}
          onClick={e => e.preventDefault()}
        >
          {canWithdraw && (
            <Button
              variant="contained"
              color="error"
              disabled={isApplicationPending}
              onClick={handleWithdraw}
            >
              Отменить отклик
            </Button>
          )}

          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenChat}
          >
            В чат
          </Button>

          <IconButton
            disabled={isFavoritePending}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? (
              <Favorite color="primary" />
            ) : (
              <FavoriteBorderOutlined />
            )}
          </IconButton>
        </Box>
      )}

      <ApplyDialog
        open={isApplyDialogOpen}
        isPending={isCreating}
        onClose={() => setIsApplyDialogOpen(false)}
        onSubmit={handleApply}
      />
    </>
  );
};
