import * as yup from 'yup';

import { MemberRole } from '@/entities/workspace-member';

export const addMemberSchema = yup.object().shape({
  email: yup
    .string()
    .default('')
    .email('Enter a valid email')
    .required('Email is required'),
  role: yup
    .string()
    .default(MemberRole.ADMIN)
    .required('Role is required')
    .oneOf(Object.values(MemberRole), 'Invalid role'),
});

export const defaultAddMemberValues = addMemberSchema.getDefault();

export type AddMemberFormType = yup.InferType<typeof addMemberSchema>;
