
import { type UseFormGetValues } from "react-hook-form"
import { useNavigate } from "react-router"

import { useDeleteApplicationMutation } from "@/entities/applications/model/api/api"
import { ROUTES } from "@/shared"

import { type FormProductType } from "../model/schema/schema"

type Props = {
    id: string
    getValues: UseFormGetValues<FormProductType>
}

export const useActions = ({ getValues, id }: Props) => {

    const { mutate: deleteApplication } = useDeleteApplicationMutation()

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

    const handleDelete = async () => {
        deleteApplication(id)
    }

    return { handleGoToPreview, handleOpenConfirmModal, handleDelete }
}