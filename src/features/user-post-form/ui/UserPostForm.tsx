'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import {
  mapPostMediaToPhotos,
  useCreatePostMutation,
  useUpdatePostMutation,
  uploadPostMediaBatch,
  useDeleteMediaMutation,
  type Post,
  type Photo,
} from '@/entities';
import { ROUTES, RHFInput } from '@/shared';

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

import Gallery from './Gallery';
import { MainInfo } from './MainInfo';

const isLocalPreview = (photo: Photo) => photo.url.startsWith('blob:');

type UserPostFormProps = {
  data?: Post;
  isEdit?: boolean;
  isLoading?: boolean;
};

export const UserPostForm = ({
  data,
  isEdit = false,
  isLoading = false,
}: UserPostFormProps) => {
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<Photo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: createPost } = useCreatePostMutation();
  const { mutateAsync: updatePost } = useUpdatePostMutation();
  const { mutateAsync: deleteMedia } = useDeleteMediaMutation();

  const methods = useForm<FormProductType>({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  const { handleSubmit, setValue, getValues, control } = methods;

  const { handleGoToPreview } = useActions({ getValues, id: data?.id || '' });

  const handleDeletePhoto = async (key: string) => {
    const photo = images.find(image => image.key === key);
    if (!photo) return;

    if (isLocalPreview(photo)) {
      setImages(prev => prev.filter(image => image.key !== key));

      if (photo.filename) {
        setFiles(prev => prev.filter(file => file.name !== photo.filename));
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

  const uploadFiles = async (postId: string) => {
    if (!files.length) return;

    await uploadPostMediaBatch(postId, files);
    setFiles([]);
  };

  const onSubmit = async (formData: FormProductType) => {
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
        error instanceof Error ? error.message : 'Не удалось сохранить пост'
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
        <MainInfo isEdit={isEdit} />

        <Gallery
          files={files}
          images={images}
          setFiles={setFiles}
          setImages={setImages}
          setDeletedFiles={handleDeletePhoto}
        />

        <RHFInput
          name="description"
          control={control}
          maxLength={400}
          props={{
            rows: 5,
            fullWidth: true,
            multiline: true,
            label: 'Описание',
            sx: { mt: 4 },
          }}
        />

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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};
