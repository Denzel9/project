import { Check, Close, DeleteOutlineOutlined } from '@mui/icons-material';
import {
    Alert,
    Button,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
    buildCreateTaskPayload,
    isTaskExecutor,
    isTaskOwner,
    TASK_STATUS_ENUM,
    useConversationsQuery,
    useCreateTaskMutation,
    type Task,
} from '@/entities';
import { MAX_SELECTED_TASKS, useAuthStore } from '@/features';
import { RequestCancelTaskDialog } from '@/pages/task/ui/RequestCancelTaskDialog';
import { RequestDeadlineExtensionDialog } from '@/pages/task/ui/RequestDeadlineExtensionDialog';
import { TaskTargetPostDialog } from '@/pages/task/ui/TaskTargetPostDialog';
import { useSnackbarStore } from '@/widgets';

type GroupAction =
    | 'duplicate'
    | 'duplicate-other'
    | 'annulment'
    | 'deadline'
    | '';

type GroupActionDialogProps = {
    open: boolean;
    tasks: Task[];
    onClose: () => void;
    onRemoveTasks: (taskIds: string[]) => void;
};

const ACTION_OPTIONS: { value: Exclude<GroupAction, ''>; label: string }[] = [
    { value: 'duplicate', label: 'Дублировать' },
    { value: 'duplicate-other', label: 'Дублировать в другое объявление' },
    { value: 'annulment', label: 'Запросить аннулирование' },
    { value: 'deadline', label: 'Запросить перенос дедлайна' },
];

const getExecutorLabel = (task: Task) => {
    if (!task.executor) return 'Исполнитель';

    return `${task.executor.name} ${task.executor.lastName}`.trim() || 'Исполнитель';
};

const getTaskLabel = (task: Task) =>
    task.title?.trim() || task.post?.title?.trim() || 'Без названия';

const canRequestAnnulmentForTask = (task: Task, currentUserId: string | null) => {
    const pendingAnnulment =
        task.annulment?.status === 'PENDING' ? task.annulment : null;

    return Boolean(
        task.status !== TASK_STATUS_ENUM.ANNULLED &&
        task.status !== TASK_STATUS_ENUM.COMPLETED &&
        task.executorId &&
        !pendingAnnulment &&
        (isTaskOwner(task, currentUserId) || isTaskExecutor(task, currentUserId)),
    );
};

const canRequestDeadlineForTask = (task: Task, currentUserId: string | null) => {
    const pendingDeadlineExtension =
        task.deadlineExtension?.status === 'PENDING'
            ? task.deadlineExtension
            : null;

    return Boolean(
        task.status !== TASK_STATUS_ENUM.ANNULLED &&
        task.status !== TASK_STATUS_ENUM.COMPLETED &&
        task.executorId &&
        !pendingDeadlineExtension &&
        (isTaskOwner(task, currentUserId) || isTaskExecutor(task, currentUserId)),
    );
};

const isTaskEligibleForAction = (
    task: Task,
    action: Exclude<GroupAction, ''>,
    currentUserId: string | null,
) => {
    if (action === 'duplicate' || action === 'duplicate-other') {
        return isTaskOwner(task, currentUserId);
    }

    if (action === 'annulment') {
        return canRequestAnnulmentForTask(task, currentUserId);
    }

    if (action === 'deadline') {
        return canRequestDeadlineForTask(task, currentUserId);
    }

    return false;
};

export const GroupActionDialog = ({
    open,
    tasks,
    onClose,
    onRemoveTasks,
}: GroupActionDialogProps) => {
    const currentUserId = useAuthStore(state => state.id);
    const { setSnackbarOpen } = useSnackbarStore();

    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

    const [action, setAction] = useState<GroupAction>('');
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
    const [isDuplicateOtherOpen, setIsDuplicateOtherOpen] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    const { mutateAsync: createTask, isPending: isCopying } =
        useCreateTaskMutation();

    const eligibleTasks = useMemo(() => {
        if (!action) return [];

        return tasks.filter(task =>
            isTaskEligibleForAction(task, action, currentUserId),
        );
    }, [action, tasks, currentUserId]);

    const ineligibleTasks = useMemo(() => {
        if (!action) return [];

        const eligibleIds = new Set(eligibleTasks.map(task => task.id));
        return tasks.filter(task => !eligibleIds.has(task.id));
    }, [action, tasks, eligibleTasks]);

    const { data: conversations = [] } = useConversationsQuery(undefined, {
        enabled: isDuplicateOtherOpen,
    });

    const executorOptions = useMemo(() => {
        const map = new Map<string, string>();

        eligibleTasks.forEach(task => {
            if (task.executorId) {
                map.set(task.executorId, getExecutorLabel(task));
            }
        });

        conversations.forEach(conversation => {
            map.set(conversation.peer.id, conversation.peer.displayName);
        });

        return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
    }, [conversations, eligibleTasks]);

    const maxDeadlineDate = useMemo(() => {
        const times = eligibleTasks
            .map(task => task.finalDate)
            .filter(Boolean)
            .map(date => new Date(date as string).getTime())
            .filter(time => !Number.isNaN(time));

        if (times.length === 0) return null;

        return new Date(Math.max(...times)).toISOString();
    }, [eligibleTasks]);

    const selectedActionLabel =
        ACTION_OPTIONS.find(option => option.value === action)?.label ?? 'действие';

    const resetActionState = () => {
        setAction('');
        setIsCancelDialogOpen(false);
        setIsDeadlineDialogOpen(false);
        setIsDuplicateOtherOpen(false);
    };

    const handleClose = () => {
        resetActionState();
        setIsExecuting(false);
        onClose();
    };

    const handleRemoveIneligible = () => {
        onRemoveTasks(ineligibleTasks.map(task => task.id));
    };

    const handleDuplicateSame = async () => {
        if (eligibleTasks.length === 0) return;

        setIsExecuting(true);
        try {
            const results = await Promise.allSettled(
                eligibleTasks.map(task => {
                    const postId = task.postId || task.post?.id;
                    if (!postId) {
                        return Promise.reject(new Error('Нет объявления'));
                    }

                    return createTask(
                        buildCreateTaskPayload(task, postId, task.executorId),
                    );
                }),
            );

            const successCount = results.filter(result => result.status === 'fulfilled').length;
            const failCount = results.length - successCount;

            if (successCount > 0 && failCount === 0) {
                setSnackbarOpen(
                    true,
                    successCount === 1
                        ? 'Задача продублирована'
                        : `Продублировано задач: ${successCount}`,
                );
                handleClose();
                return;
            }

            if (successCount > 0) {
                setSnackbarOpen(
                    true,
                    `Продублировано: ${successCount}, не удалось: ${failCount}`,
                    'error',
                );
                handleClose();
                return;
            }

            setSnackbarOpen(true, 'Не удалось дублировать задачи', 'error');
        } finally {
            setIsExecuting(false);
        }
    };

    const handleDuplicateOtherConfirm = async ({
        postId,
        executorId,
    }: {
        postId: string;
        executorId: string | null;
    }) => {
        const results = await Promise.allSettled(
            eligibleTasks.map(task =>
                createTask(buildCreateTaskPayload(task, postId, executorId)),
            ),
        );

        const successCount = results.filter(result => result.status === 'fulfilled').length;
        const failCount = results.length - successCount;

        if (successCount > 0 && failCount === 0) {
            setSnackbarOpen(
                true,
                successCount === 1
                    ? 'Задача продублирована'
                    : `Продублировано задач: ${successCount}`,
            );
            handleClose();
            return;
        }

        if (successCount > 0) {
            setSnackbarOpen(
                true,
                `Продублировано: ${successCount}, не удалось: ${failCount}`,
                'error',
            );
            handleClose();
            return;
        }

        setSnackbarOpen(true, 'Не удалось дублировать задачи', 'error');
        throw new Error('bulk duplicate failed');
    };

    const handleExecute = () => {
        if (!action || eligibleTasks.length === 0 || ineligibleTasks.length > 0) {
            return;
        }

        if (action === 'duplicate') {
            void handleDuplicateSame();
            return;
        }

        if (action === 'duplicate-other') {
            setIsDuplicateOtherOpen(true);
            return;
        }

        if (action === 'annulment') {
            setIsCancelDialogOpen(true);
            return;
        }

        if (action === 'deadline') {
            setIsDeadlineDialogOpen(true);
        }
    };

    if (!open) return null;

    const busy = isExecuting || isCopying;
    const canExecute =
        Boolean(action) &&
        eligibleTasks.length > 0 &&
        ineligibleTasks.length === 0 &&
        !busy;

    return (
        <>
            <Paper
                elevation={8}
                sx={{
                    left: '50%',
                    position: 'fixed',
                    p: { xs: 2, md: 4 },
                    borderRadius: '24px',
                    bottom: { xs: 0, md: 24 },
                    transform: 'translateX(-50%)',
                    zIndex: theme => theme.zIndex.snackbar,
                    borderBottomLeftRadius: { xs: 0, md: 24 },
                    borderBottomRightRadius: { xs: 0, md: 24 },
                    width: { xs: '100%', md: 'min(800px, calc(100% - 32px))' },
                }}
            >
                <Stack
                    direction="column"
                    spacing={2}
                >
                    <Stack
                        spacing={2}
                        direction="row"
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <Typography>
                            Выбрано: {tasks.length} / {MAX_SELECTED_TASKS}
                        </Typography>

                        <IconButton
                            size="small"
                            onClick={handleClose}
                            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: 'center' }}
                    >
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Действие"
                            variant="outlined"
                            value={action}
                            onChange={event => setAction(event.target.value as GroupAction)}
                            slotProps={{
                                select: {
                                    MenuProps: {
                                        sx: {
                                            zIndex: theme => theme.zIndex.snackbar + 1,
                                        },
                                    },
                                },
                            }}
                        >
                            {ACTION_OPTIONS.map(option => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!canExecute}
                            loading={busy}
                            onClick={handleExecute}
                            sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' } }}
                        >
                            Выполнить
                        </Button>

                        <IconButton
                            size="small"
                            onClick={handleExecute}
                            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                        >
                            <Check fontSize="small" />
                        </IconButton>

                        <Button
                            variant="outlined"
                            color="primary"
                            disabled={busy}
                            onClick={handleClose}
                            sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' } }}
                        >
                            Закрыть
                        </Button>
                    </Stack>

                    {ineligibleTasks.length > 0 && (
                        <Alert
                            severity="warning"
                            action={
                                isMobile ?
                                    <IconButton
                                        size="small"
                                        onClick={handleRemoveIneligible}
                                        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                                    >
                                        <DeleteOutlineOutlined fontSize="small" />
                                    </IconButton>
                                    : <Button
                                        color="inherit"
                                        size="small"
                                        onClick={handleRemoveIneligible}
                                        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                                    >
                                        Убрать из выбранных
                                    </Button>
                            }
                            sx={{
                                alignItems: 'flex-start',
                                '& .MuiAlert-message': { width: '100%' },
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{ mb: 0.5 }}
                            >
                                Для {ineligibleTasks.length === 1 ? 'этой задачи' : 'этих задач'}{' '}
                                недоступно действие «{selectedActionLabel}»:
                            </Typography>
                            <Typography
                                variant="body2"
                                component="ul"
                                sx={{ m: 0, pl: 2 }}
                            >
                                {ineligibleTasks.map(task => (
                                    <li key={task.id}>{getTaskLabel(task)}</li>
                                ))}
                            </Typography>
                        </Alert>
                    )}
                </Stack>
            </Paper>

            <RequestCancelTaskDialog
                open={isCancelDialogOpen}
                taskIds={eligibleTasks.map(task => task.id)}
                onClose={() => setIsCancelDialogOpen(false)}
                onSuccess={handleClose}
            />

            <RequestDeadlineExtensionDialog
                open={isDeadlineDialogOpen}
                taskIds={eligibleTasks.map(task => task.id)}
                currentFinalDate={maxDeadlineDate}
                onClose={() => setIsDeadlineDialogOpen(false)}
                onSuccess={handleClose}
            />

            <TaskTargetPostDialog
                open={isDuplicateOtherOpen}
                mode="duplicate"
                excludePostId={null}
                initialExecutorId={eligibleTasks[0]?.executorId ?? null}
                executorOptions={executorOptions}
                isPending={isCopying}
                onClose={() => setIsDuplicateOtherOpen(false)}
                onConfirm={handleDuplicateOtherConfirm}
                onGoToCreatedTask={() => handleClose()}
            />
        </>
    );
};
