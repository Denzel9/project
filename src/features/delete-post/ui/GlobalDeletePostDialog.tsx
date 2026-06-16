import { useDeletePostDialogStore } from '../model/store';

import { DeletePostDialog } from './DeletePostDialog';

export const GlobalDeletePostDialog = () => {
  const { isOpen, postId, closeDeletePostDialog } = useDeletePostDialogStore();

  return (
    <DeletePostDialog
      open={isOpen}
      postId={postId}
      onClose={closeDeletePostDialog}
    />
  );
};
