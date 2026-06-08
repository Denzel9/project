'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button } from '@mui/material';
// import 'react-calendar/dist/Calendar.css';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import {
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
} from '@/entities/applications/model/api/api';
import {
  useDeleteFileMutation,
  useGetFilesQuery,
  useUploadFileMutation,
  type Photo,
} from '@/entities/photo';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared';

import { useActions } from '../hooks/useActions';
import {
  defaultValues,
  schema,
  schemaKeys,
  type FormProductType,
} from '../model/schema/schema';

import Gallery from './Gallery';
import { MainInfo } from './MainInfo';
import { ProductInfo } from './ProductInfo';

import type { Application } from '../model/types';

type ApplicationFormProps = {
  isEdit?: boolean;
  data?: Application;
};

export const ApplicationForm = ({
  data,
  isEdit = false,
}: ApplicationFormProps) => {
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<Photo[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);

  const { user } = useAuthStore();

  const { mutate: create } = useCreateApplicationMutation();
  const { mutate: update } = useUpdateApplicationMutation();
  const { mutate: uploadFile } = useUploadFileMutation();
  const { mutate: deletedUploadFiles } = useDeleteFileMutation();
  const { data: photoData } = useGetFilesQuery();

  const methods = useForm<FormProductType>({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  const { handleSubmit, setValue, getValues } = methods;

  const { handleGoToPreview } = useActions({ getValues, id: data?.id || '' });

  const handleDeletePhoto = (id: string) => {
    setDeletedFiles([...deletedFiles, id]);
  };

  const handleThenCreate = () => {
    navigate(ROUTES.PROFILE);
  };

  const handleThenUpdate = () => {
    navigate(ROUTES.PROFILE);
  };

  const handleFileUpload = async () => {
    try {
      if (files?.length) {
        const uploadPromises = Array.from(files).map(async file => {
          const formData = new FormData();
          formData.append('file', file);

          return await uploadFile({
            data: formData,
            folder: 'product',
            id: data?.id || '',
          });
        });

        return await Promise.all(uploadPromises);
      }

      if (deletedFiles?.length) {
        await deletedUploadFiles({ keys: deletedFiles });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const onSubmit = (formData: any) => {
    if (user?.id) {
      if (isEdit && data?.id) {
        handleFileUpload()
          .then(res => {
            let mainImage = '';
            if (!res) {
              mainImage = images?.[0]?.key;
            } else {
              mainImage = res?.[0]?.key;
            }

            update({ ...formData, ownerId: user?.id, id: data?.id, mainImage });
          })
          .then(() => handleThenUpdate())
          .catch(err => console.log(err));
      } else {
        handleFileUpload()
          .then(res =>
            create({ ...formData, ownerId: user?.id, mainImage: res?.[0]?.key })
          )
          .then(() => handleThenCreate())
          .catch(err => console.log(err));
      }
    }
  };

  useEffect(() => {
    const initialData = data;

    if (initialData) {
      schemaKeys.forEach(key => {
        if (initialData?.[key]) {
          setValue(key, initialData?.[key]);
        }
      });
    }
  }, [data, setValue]);

  useEffect(() => {
    const newPhoto = [...Array.from(photoData?.data?.files || [])]?.sort(
      (a, b) => {
        if (a?.key === data?.mainImage) return -1;
        if (b?.key === data?.mainImage) return 1;
        return 0;
      }
    ) as Photo[];

    setTimeout(() => {
      setImages(newPhoto);
    }, 0);
  }, [data?.mainImage, photoData?.data?.files]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box>
          <MainInfo
            id={data?.id || ''}
            isEdit={isEdit}
          />

          <Gallery
            files={files}
            setFiles={setFiles}
            images={images}
            setImages={setImages}
            mainImage={data?.mainImage}
            setDeletedFiles={handleDeletePhoto}
          />

          <ProductInfo />

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
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};
