'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useDeleteMediaMutation } from '@/entities/media';
import {
  mapPostMediaToPhotos,
  useCreatePostMutation,
  useUpdatePostMutation,
  uploadPostMediaBatch,
  type Post,
} from '@/entities/post';
import {
  useRequireEmailConfirmed,
  getEmailConfirmErrorMessage,
} from '@/features/auth';
import { ROUTES } from '@/shared';
import { ConfirmDialog, useSnackbarStore } from '@/widgets';

import { useActions } from '../hooks/useActions';
import {
  mapFormToCreatePost,
  mapFormToUpdatePost,
  mapPostToForm,
} from '../model/mappers';
import {
  defaultValues,
  schema,
  schemaKeys,
  type FormProductType,
} from '../model/schema/schema';

import {
  BloggerRequirementsSection,
  BriefSection,
  CooperationSection,
  LocationSection,
  MetaSection,
} from './AdditionalSections';
import { Gallery } from './Gallery';
import { MainInfo } from './MainInfo';
import { ProductInfo } from './ProductInfo';

import type { Photo } from '@/entities/photo';
import {
  hasPreparingMedia,
  patchPhotoByLocalId,
  prepareLocalMediaFile,
  revokeLocalPhotoUrl,
  type LocalMediaFile,
} from '@/shared/lib/media';

const isLocalPreview = (photo: Photo) =>
  Boolean(photo.localId) || photo.url.startsWith('blob:');

type ApplicationFormProps = {
  data?: Post;
  isEdit?: boolean;
  isLoading?: boolean;
};

export const ApplicationForm = ({
  data,
  isEdit = false,
  isLoading = false,
}: ApplicationFormProps) => {
  const navigate = useNavigate();

  const { setSnackbarOpen } = useSnackbarStore();

  const [files, setFiles] = useState<LocalMediaFile[]>([]);
  const [images, setImages] = useState<Photo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { mutateAsync: createPost } = useCreatePostMutation();
  const { mutateAsync: updatePost } = useUpdatePostMutation();
  const { mutateAsync: deleteMedia } = useDeleteMediaMutation();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  const methods = useForm<FormProductType>({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  const { handleSubmit, setValue, getValues } = methods;

  const {
    menuOptions,
    handleMenuAction,
    handleGoToPreview,
    deleteApplication,
  } = useActions({
    isEdit,
    setValue,
    getValues,
    id: data?.id || '',
    setIsConfirmDialogOpen,
    isPrivate: data?.isPrivate ?? false,
    isArchived: data?.isArchived ?? false,
  });

  const handleDeletePhoto = async (key: string) => {
    const photo = images.find(
      image => image.key === key || image.localId === key,
    );
    if (!photo) return;

    if (isLocalPreview(photo)) {
      revokeLocalPhotoUrl(photo);
      setImages(prev =>
        prev.filter(
          image => image.key !== photo.key && image.localId !== photo.localId,
        ),
      );

      if (photo.localId) {
        setFiles(prev => prev.filter(file => file.localId !== photo.localId));
      }

      return;
    }

    if (!photo.id || !data?.id) return;

    try {
      await deleteMedia({ mediaId: photo.id, postId: data.id });
      setImages(prev => prev.filter(image => image.key !== key));
    } catch {
      // keep image in list on error
    }
  };

  const handleRetryLocal = async (localId: string) => {
    const item = files.find(file => file.localId === localId);
    if (!item) return;

    setImages(prev =>
      patchPhotoByLocalId(prev, localId, {
        uploadStatus: 'preparing',
        uploadError: undefined,
      }),
    );

    try {
      const prepared = await prepareLocalMediaFile(item);
      const previewUrl = URL.createObjectURL(prepared.file);

      setFiles(prev =>
        prev.map(file => (file.localId === localId ? prepared : file)),
      );
      setImages(prev =>
        prev.map(image => {
          if (image.localId !== localId) return image;
          revokeLocalPhotoUrl(image);
          return {
            ...image,
            url: previewUrl,
            mimeType: prepared.file.type,
            size: String(prepared.file.size),
            uploadStatus: 'ready',
            uploadProgress: 0,
            uploadError: undefined,
          };
        }),
      );
    } catch (error) {
      setImages(prev =>
        patchPhotoByLocalId(prev, localId, {
          uploadStatus: 'error',
          uploadError:
            error instanceof Error
              ? error.message
              : 'Не удалось подготовить файл',
        }),
      );
    }
  };

  const uploadFiles = async (postId: string) => {
    if (!files.length) return;
    if (hasPreparingMedia(images)) {
      throw new Error('Дождитесь сжатия файлов');
    }

    const succeeded = new Set<string>();

    await uploadPostMediaBatch(postId, files, {
      onFileStart: localId => {
        setImages(prev =>
          patchPhotoByLocalId(prev, localId, {
            uploadStatus: 'uploading',
            uploadProgress: 0,
          }),
        );
      },
      onFileProgress: (localId, progress) => {
        setImages(prev =>
          patchPhotoByLocalId(prev, localId, { uploadProgress: progress }),
        );
      },
      onFileSuccess: localId => {
        succeeded.add(localId);
      },
      onFileError: (localId, error) => {
        setImages(prev =>
          patchPhotoByLocalId(prev, localId, {
            uploadStatus: 'error',
            uploadError: error.message,
          }),
        );
      },
    });

    setFiles(prev => prev.filter(file => !succeeded.has(file.localId)));
    setImages(prev => {
      prev.forEach(photo => {
        if (photo.localId && succeeded.has(photo.localId)) {
          revokeLocalPhotoUrl(photo);
        }
      });
      return prev.filter(
        photo => !photo.localId || !succeeded.has(photo.localId),
      );
    });

    if (succeeded.size < files.length) {
      throw new Error('Некоторые файлы не загрузились');
    }
  };

  const onSubmit = async (formData: FormProductType) => {
    if (!requireEmailConfirmed()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isEdit && data?.id) {
        const post = await updatePost({
          id: data.id,
          body: mapFormToUpdatePost(formData),
        });

        await uploadFiles(post.id);
        navigate(ROUTES.PROFILE);
        return;
      }

      const post = await createPost(mapFormToCreatePost(formData));
      await uploadFiles(post.id);
      navigate(ROUTES.PROFILE);
    } catch (error) {
      setSubmitError(
        getEmailConfirmErrorMessage(error, 'Не удалось сохранить пост')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!data) return;

    const formValues = mapPostToForm(data);

    schemaKeys.forEach(key => {
      if (formValues[key] !== undefined) {
        setValue(key, formValues[key] as FormProductType[typeof key]);
      }
    });

    if (files.length === 0) {
      setTimeout(() => {
        setImages(mapPostMediaToPhotos(data.media));
      }, 0);
    }
  }, [data, setValue, files.length]);

  const handleDeleteApplication = async () => {
    if (!data?.id) return;

    try {
      await deleteApplication(data.id);
      navigate(ROUTES.PROFILE);
    } catch {
      setSnackbarOpen?.(true, 'Не удалось удалить объявление');
    }

    setIsConfirmDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <MainInfo
          isEdit={isEdit}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
        />

        <Gallery
          files={files}
          images={images}
          setFiles={setFiles}
          setImages={setImages}
          setDeletedFiles={handleDeletePhoto}
          onRetryPrepare={handleRetryLocal}
        />

        <ProductInfo />

        <MetaSection />
        <LocationSection />
        <BloggerRequirementsSection />
        <CooperationSection />
        <BriefSection />

        {submitError && (
          <Box sx={{ color: 'error.main', mt: 2 }}>{submitError}</Box>
        )}

        <Box
          sx={{
            mt: 8,
            gap: 2,
            display: 'flex',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleGoToPreview}
            sx={{ display: { xs: 'none', lg: 'block' } }}
          >
            Назад
          </Button>

          <Button
            type="submit"
            color="success"
            variant="outlined"
            disabled={isSubmitting || hasPreparingMedia(images)}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </form>

      <ConfirmDialog
        title="Удалить объявление"
        isOpen={isConfirmDialogOpen}
        onSuccess={handleDeleteApplication}
        onClose={() => setIsConfirmDialogOpen(false)}
        description="Вы уверены, что хотите удалить это объявление?"
      />
    </FormProvider>
  );
};
