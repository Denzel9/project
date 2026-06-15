import { useUploadFileMutation } from '@/entities/photo';
import { useUpdateUserMutation } from '@/entities/user';

export type ProfileMediaField = 'avatar' | 'banner';

type UseProfileMediaUploadOptions = {
  onSuccess?: (field: ProfileMediaField, url: string) => void;
  onError?: (message: string) => void;
};

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  return 'Не удалось загрузить';
};

export const useProfileMediaUpload = (options?: UseProfileMediaUploadOptions) => {
  const { mutateAsync: uploadFile, isPending: isUploading } =
    useUploadFileMutation();
  const { mutateAsync: updateUser, isPending: isUpdating } =
    useUpdateUserMutation();

  const upload = async (field: ProfileMediaField, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile({ data: formData });
      await updateUser({ [field]: response.url });

      options?.onSuccess?.(field, response.url);
    } catch (error) {
      options?.onError?.(getErrorMessage(error));
    }
  };

  return {
    upload,
    isPending: isUploading || isUpdating,
  };
};
