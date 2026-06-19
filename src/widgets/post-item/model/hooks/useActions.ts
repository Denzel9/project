import { useNavigate } from "react-router";

import { useUpdatePostMutation, useRemoveFavoriteMutation } from "@/entities";
import { useDeletePostDialogStore } from "@/features";
import { ROUTES } from "@/shared";
import { useSnackbarStore } from "@/widgets";

import { ACTION_BUTTONS, ACTION_BUTTONS_KEYS } from "../constants";
import { useApplicationItemStore } from "../store";

import type { ActionButton } from "../types";
import type { UseActionsProps } from "../types/index";

export const useActions = ({ permissions, id, }: UseActionsProps) => {
    const { mutateAsync: removeFavorite } = useRemoveFavoriteMutation();
    const { mutateAsync: updatePost } = useUpdatePostMutation();

    const { setSnackbarOpen } = useSnackbarStore();

    const { openDeletePostDialog } = useDeletePostDialogStore();
    const { setOpenAddToCollectionDialog } = useApplicationItemStore();


    const navigate = useNavigate();

    const allowedActions: ActionButton[] = [];

    const handleAddToCollection = () => {
        setOpenAddToCollectionDialog(true, id);
    };

    const handleRemoveFromCollection = () => {
        removeFavorite(id);
    };

    const handleDelete = () => {
        openDeletePostDialog(id);
    };

    const handleEdit = () => {
        navigate({ pathname: ROUTES.MANAGE_APPLICATION, search: `?id=${id}` });
    };

    const handleAddToArchive = async () => {
        await updatePost({ id, body: { isArchived: true } });
        setSnackbarOpen?.(true, 'Пост добавлен в архив');
    };

    const handleRemoveFromArchive = async () => {
        await updatePost({ id, body: { isArchived: false } });
        setSnackbarOpen?.(true, 'Пост удален из архива');
    };

    const handleAction = (action: ACTION_BUTTONS_KEYS) => {
        if (action === ACTION_BUTTONS_KEYS.ADD_TO_COLLECTION) {
            handleAddToCollection();
        } else if (action === ACTION_BUTTONS_KEYS.ADD_TO_FAVORITE_GROUP) {
            handleAddToCollection();
        } else if (action === ACTION_BUTTONS_KEYS.REMOVE_FROM_COLLECTION) {
            handleRemoveFromCollection();
        } else if (action === ACTION_BUTTONS_KEYS.DELETE) {
            handleDelete();
        } else if (action === ACTION_BUTTONS_KEYS.EDIT) {
            handleEdit();
        } else if (action === ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE) {
            handleAddToArchive();
        } else if (action === ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE) {
            handleRemoveFromArchive();
        }
    };

    ACTION_BUTTONS.forEach(action => {
        if (permissions.includes(action.key)) {
            allowedActions.push(action);
        }
    });

    return {
        allowedActions,
        handleAction
    };
};