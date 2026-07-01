import {
  AttachFile,
  ExpandMore,
  ForumOutlined,
  Search,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Fade,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router';

import { type TaskCommentMedia } from '@/entities';
import { useAuthStore } from '@/features';
import { toGalleryItems } from '@/pages/task/model/lib/commentMedia';
import { TaskCommentAttachmentsPanel } from '@/pages/task/ui/TaskCommentAttachmentsPanel';
import { TaskCommentComposer } from '@/pages/task/ui/TaskCommentComposer';
import { TaskCommentSearchPanel } from '@/pages/task/ui/TaskCommentSearchPanel';
import { FullScreenGallery } from '@/widgets';

import { DASHBOARD_COMMENT_CARD_COLLAPSE_MS } from '../model/constants';
import { useDashboardTaskCommentsThread } from '../model/useDashboardTaskCommentsThread';
import {
  getCommentPreview,
  getCommentsLabel,
  getDashboardTaskPath,
  getTaskDisplayTitle,
  type DashboardTaskCommentsItem,
} from '../model/utils';

import { DashboardCommentListItem } from './DashboardCommentListItem';

const SCROLL_LOAD_THRESHOLD_PX = 48;

const flexCollapseSx = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  '& .MuiCollapse-wrapper': {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  },
  '& .MuiCollapse-wrapperInner': {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
} as const;

type DashboardCommentGroupCardProps = {
  item: DashboardTaskCommentsItem;
  highlight?: string;
  expanded: boolean;
  fillHeight?: boolean;
  onToggle?: () => void;
  onCommentSuccess?: () => void;
};

export const DashboardCommentGroupCard = ({
  item,
  highlight,
  expanded,
  fillHeight = false,
  onToggle,
  onCommentSuccess,
}: DashboardCommentGroupCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentUserId = useAuthStore(state => state.id);
  const messagesRef = useRef<HTMLDivElement>(null);
  const skipScrollToBottomRef = useRef(false);
  const prevItemsLengthRef = useRef(0);
  const taskId = item.task.id;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<
    ReturnType<typeof toGalleryItems>
  >([]);
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0);

  const {
    items: sortedComments,
    hasOlder,
    loadOlder,
    isLoadingOlder,
    isRefreshing,
    consumeScrollRestoreHeight,
  } = useDashboardTaskCommentsThread({
    taskId: expanded ? taskId : null,
    task: item.task,
    lastComment: item.lastComment,
    expanded,
  });

  const taskTitle = getTaskDisplayTitle(item.task);
  const taskPath = getDashboardTaskPath(item.task);
  const latestPreview = getCommentPreview(item.lastComment);
  const unreadCount = item.unreadCount ?? 0;

  const openGallery = useCallback(
    (media: TaskCommentMedia[] | undefined, initialSlide: number) => {
      const gallery = toGalleryItems(media ?? []);

      if (!gallery.length) return;

      setGalleryItems(gallery);
      setGalleryInitialSlide(initialSlide);
      setGalleryOpen(true);
    },
    [],
  );

  const openGalleryFromItems = useCallback(
    (gallery: ReturnType<typeof toGalleryItems>, initialSlide: number) => {
      if (!gallery.length) return;

      setGalleryItems(gallery);
      setGalleryInitialSlide(initialSlide);
      setGalleryOpen(true);
    },
    [],
  );

  const handleLoadOlder = useCallback(() => {
    skipScrollToBottomRef.current = true;
    void loadOlder(messagesRef.current);
  }, [loadOlder]);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesRef.current;

    if (!container || isLoadingOlder || !hasOlder) return;

    if (container.scrollTop <= SCROLL_LOAD_THRESHOLD_PX) {
      handleLoadOlder();
    }
  }, [handleLoadOlder, hasOlder, isLoadingOlder]);

  const handleToggle = () => {
    onToggle?.();
  };

  useLayoutEffect(() => {
    const container = messagesRef.current;
    const previousHeight = consumeScrollRestoreHeight();

    if (!container || previousHeight === null) return;

    container.scrollTop = container.scrollHeight - previousHeight;
  }, [sortedComments.length, consumeScrollRestoreHeight]);

  useEffect(() => {
    if (!expanded) {
      prevItemsLengthRef.current = 0;
      return;
    }

    const container = messagesRef.current;

    if (!container) return;

    if (skipScrollToBottomRef.current) {
      skipScrollToBottomRef.current = false;
      prevItemsLengthRef.current = sortedComments.length;
      return;
    }

    const isNewMessageAtEnd =
      sortedComments.length > prevItemsLengthRef.current &&
      prevItemsLengthRef.current > 0;

    if (prevItemsLengthRef.current === 0 || isNewMessageAtEnd) {
      container.scrollTop = container.scrollHeight;
    }

    prevItemsLengthRef.current = sortedComments.length;
  }, [expanded, sortedComments.length]);

  useEffect(() => {
    if (expanded) return;

    const timer = window.setTimeout(() => {
      setIsSearchOpen(false);
      setIsAttachmentsOpen(false);
    }, DASHBOARD_COMMENT_CARD_COLLAPSE_MS);

    return () => window.clearTimeout(timer);
  }, [expanded]);

  return (
    <Box
      sx={{
        display: 'flex',
        overflow: 'hidden',
        borderRadius: '20px',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: expanded ? 'primary.light' : 'divider',
        bgcolor: 'background.paper',
        boxShadow: expanded
          ? theme => `0 8px 24px ${theme.palette.primary.main}12`
          : '0 1px 2px rgba(15, 23, 42, 0.04)',
        transition: theme.transitions.create(
          ['box-shadow', 'border-color', 'flex'],
          { duration: DASHBOARD_COMMENT_CARD_COLLAPSE_MS },
        ),
        ...(fillHeight && {
          flex: 1,
          minHeight: 0,
        }),
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 1.5,
          py: 1.25,
          cursor: 'pointer',
          flexShrink: 0,
          alignItems: 'center',
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'divider',
        }}
        onClick={handleToggle}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            display: 'flex',
            flexShrink: 0,
            borderRadius: '12px',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            bgcolor: theme => `${theme.palette.primary.main}12`,
          }}
        >
          <ForumOutlined sx={{ fontSize: 20 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            onClick={event => event.stopPropagation()}
            component={Link}
            to={taskPath}
            variant="subtitle2"
            color="primary"
            sx={{
              fontWeight: 600,
              display: 'block',
              textDecoration: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: 'fit-content',
              maxWidth: '100%',
              ':hover': { textDecoration: 'underline' },
            }}
          >
            {taskTitle}
          </Typography>

          {!expanded && latestPreview && (
            <Fade
              in
              timeout={DASHBOARD_COMMENT_CARD_COLLAPSE_MS}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {latestPreview}
              </Typography>
            </Fade>
          )}
        </Box>

        {unreadCount > 0 && (
          <Chip
            size="small"
            color="error"
            label={unreadCount}
            sx={{ minWidth: 28 }}
          />
        )}

        {expanded && (
          <Fade
            in
            timeout={DASHBOARD_COMMENT_CARD_COLLAPSE_MS}
          >
            <Stack
              direction="row"
              spacing={0.25}
              sx={{ flexShrink: 0 }}
              onClick={event => event.stopPropagation()}
            >
              <Tooltip title="Поиск по комментариям">
                <IconButton
                  size="small"
                  aria-label="Поиск по комментариям"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Вложения">
                <IconButton
                  size="small"
                  aria-label="Вложения"
                  onClick={() => setIsAttachmentsOpen(true)}
                >
                  <AttachFile fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Fade>
        )}

        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={`${item.commentsCount} ${getCommentsLabel(item.commentsCount)}`}
        />

        <IconButton
          size="small"
          aria-expanded={expanded}
          aria-label={
            expanded ? 'Свернуть комментарии' : 'Развернуть комментарии'
          }
          onClick={event => {
            event.stopPropagation();
            handleToggle();
          }}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${DASHBOARD_COMMENT_CARD_COLLAPSE_MS}ms ease`,
          }}
        >
          <ExpandMore fontSize="small" />
        </IconButton>
      </Stack>

      <Collapse
        in={expanded}
        timeout={DASHBOARD_COMMENT_CARD_COLLAPSE_MS}
        unmountOnExit
        sx={fillHeight ? flexCollapseSx : undefined}
      >
        <Divider />
        <Stack
          ref={messagesRef}
          spacing={1.25}
          onScroll={handleMessagesScroll}
          sx={{
            p: 1.5,
            flex: fillHeight ? 1 : undefined,
            minHeight: fillHeight ? 0 : undefined,
            maxHeight: fillHeight ? undefined : 360,
            overflowY: 'auto',
            bgcolor: 'grey.50',
            opacity: isRefreshing ? 0.72 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          {hasOlder && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 0.5 }}>
              <Button
                size="small"
                variant="text"
                disabled={isLoadingOlder}
                onClick={handleLoadOlder}
              >
                {isLoadingOlder ? (
                  <CircularProgress size={16} />
                ) : (
                  'Загрузить ранние сообщения'
                )}
              </Button>
            </Box>
          )}

          {sortedComments.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2, textAlign: 'center' }}
            >
              Нет сообщений
            </Typography>
          )}

          {sortedComments.map(threadItem => (
            <DashboardCommentListItem
              key={threadItem.comment.id}
              item={threadItem}
              highlight={highlight}
              currentUserId={currentUserId}
            />
          ))}
        </Stack>

        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
          onClick={event => event.stopPropagation()}
        >
          <TaskCommentComposer
            taskId={taskId}
            executorId={item.task.executorId}
            isExecutorApprove={item.task.isExecutorApprove}
            placeholder="Написать комментарий…"
            onSuccess={onCommentSuccess}
          />
        </Box>
      </Collapse>

      {expanded && taskId && (
        <>
          <TaskCommentSearchPanel
            taskId={taskId}
            open={isSearchOpen}
            onOpenGallery={openGallery}
            currentUserId={currentUserId}
            onClose={() => setIsSearchOpen(false)}
          />

          <TaskCommentAttachmentsPanel
            taskId={taskId}
            open={isAttachmentsOpen}
            onOpenGallery={openGalleryFromItems}
            onClose={() => setIsAttachmentsOpen(false)}
          />
        </>
      )}

      <FullScreenGallery
        isMobile={isMobile}
        items={galleryItems}
        isOpen={galleryOpen}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box>
  );
};
