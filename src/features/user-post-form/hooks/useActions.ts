import { type UseFormGetValues } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { useUpdatePostMutation } from '@/entities/post'
import { ROUTES } from '@/shared'
import { useSnackbarStore } from '@/widgets'

import { type FormProductType } from '../model/schema/schema'

export const MENU_ACTION = {
  ADD_TO_ARCHIVE: 'Переместить в архив',
  REMOVE_FROM_ARCHIVE: 'Вернуть из архива',
  MAKE_PRIVATE: 'Сделать приватным',
  MAKE_PUBLIC: 'Сделать публичным',
} as const

type Props = {
  id: string
  isEdit?: boolean
  isArchived?: boolean
  isPrivate?: boolean
  getValues: UseFormGetValues<FormProductType>
}

export const useActions = ({
  getValues,
  id,
  isEdit = false,
  isArchived = false,
  isPrivate = false,
}: Props) => {
  const { mutateAsync: updatePost } = useUpdatePostMutation()
  const { setSnackbarOpen } = useSnackbarStore()
  const navigate = useNavigate()

  const handleGoToPreview = () => {
    const formData = getValues()

    if (Object.values(formData).filter(Boolean).length) {
      navigate(ROUTES.PROFILE)
    }
  }

  const handleOpenConfirmModal = () => {
    // dispatch(openModal({ type: ModalTypes.CONFIRM }))
  }

  const handleAddToArchive = async () => {
    if (!id) return
    await updatePost({ id, body: { isArchived: true } })
    setSnackbarOpen?.(true, 'Пост перемещен в архив')
  }

  const handleRemoveFromArchive = async () => {
    if (!id) return
    await updatePost({ id, body: { isArchived: false } })
    setSnackbarOpen?.(true, 'Пост возвращен из архива')
  }

  const handleMakePrivate = async () => {
    if (!id) return
    await updatePost({ id, body: { isPrivate: true } })
    setSnackbarOpen?.(true, 'Пост сделан приватным')
  }

  const handleMakePublic = async () => {
    if (!id) return
    await updatePost({ id, body: { isPrivate: false } })
    setSnackbarOpen?.(true, 'Пост сделан публичным')
  }

  const menuOptions = (() => {
    if (!isEdit || !id) return []

    return [
      isArchived
        ? MENU_ACTION.REMOVE_FROM_ARCHIVE
        : MENU_ACTION.ADD_TO_ARCHIVE,
      isPrivate ? MENU_ACTION.MAKE_PUBLIC : MENU_ACTION.MAKE_PRIVATE,
    ]
  })()

  const handleMenuAction = (action: string) => {
    if (action === MENU_ACTION.ADD_TO_ARCHIVE) {
      void handleAddToArchive()
      return
    }

    if (action === MENU_ACTION.REMOVE_FROM_ARCHIVE) {
      void handleRemoveFromArchive()
      return
    }

    if (action === MENU_ACTION.MAKE_PRIVATE) {
      void handleMakePrivate()
      return
    }

    if (action === MENU_ACTION.MAKE_PUBLIC) {
      void handleMakePublic()
    }
  }

  return {
    menuOptions,
    handleMenuAction,
    handleGoToPreview,
    handleOpenConfirmModal,
  }
}
