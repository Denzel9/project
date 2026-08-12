import {
  Check,
  DownloadOutlined,
  MoreVert,
  PrintOutlined,
} from '@mui/icons-material';
import {
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';

import { useAuthStore } from '@/features/auth';

import { useMyTaskFilterStore } from '../../model/store';
import { AddTaskDialog } from '../AddTaskDialog';

export type TaskTableReportControls = {
  disabled: boolean;
  isExporting: boolean;
  isPrinting?: boolean;
  onPrint: () => void;
  onExport: () => void;
};

type TaskFilterActionsMenuProps = {
  isCompany: boolean;
  tableReport?: TaskTableReportControls;
};

export const TaskFilterActionsMenu = ({
  isCompany,
  tableReport,
}: TaskFilterActionsMenuProps) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const { isPrime } = useAuthStore()

  const viewMode = useMyTaskFilterStore(state => state.viewMode);
  const groupByPost = useMyTaskFilterStore(state => state.groupByPost);
  const setGroupByPost = useMyTaskFilterStore(state => state.setGroupByPost);
  const isTaskSelectionMode = useMyTaskFilterStore(
    state => state.isTaskSelectionMode,
  );
  const setTaskSelectionMode = useMyTaskFilterStore(
    state => state.setTaskSelectionMode,
  );

  const showGroupByPost = viewMode === 'grid' && isPrime;
  const showSelectionMode = true;
  const showMenu =
    isCompany || Boolean(tableReport) || showGroupByPost || showSelectionMode;

  if (!showMenu) return null;

  const closeMenu = () => setMenuAnchor(null);

  return (
    <>
      <Tooltip title="Ещё">
        <IconButton
          size="small"
          aria-label="Дополнительные действия"
          onClick={event => setMenuAnchor(event.currentTarget)}
        >
          {tableReport?.isPrinting || tableReport?.isExporting ? (
            <CircularProgress
              size={16}
              color="inherit"
            />
          ) : (
            <MoreVert fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          overflow: 'hidden',
        }}
      >
        {showSelectionMode && (
          <MenuItem
            onClick={() => {
              setTaskSelectionMode(!isTaskSelectionMode);
              closeMenu();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <ListItemText>Выбрать</ListItemText>

            {isTaskSelectionMode && (
              <Check
                fontSize="small"
                color="primary"
              />
            )}
          </MenuItem>
        )}

        {showGroupByPost && (
          <MenuItem
            disabled={isTaskSelectionMode}
            onClick={() => {
              setGroupByPost(!groupByPost);
              closeMenu();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <ListItemText>Сгруппировать по объявлениям</ListItemText>

            {groupByPost && (
              <Check
                fontSize="small"
                color="primary"
              />
            )}
          </MenuItem>
        )}

        <Divider
          component="li"
          sx={{ my: 0.5 }}
        />

        {isCompany && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setIsAddTaskOpen(true);
            }}
          >
            <ListItemText>Добавить задачу</ListItemText>
          </MenuItem>
        )}

        {tableReport && (isCompany || showGroupByPost) && (
          <Divider
            component="li"
            sx={{ my: 0.5 }}
          />
        )}

        {tableReport && (
          <MenuItem
            disabled={tableReport.disabled || tableReport.isPrinting}
            onClick={() => {
              closeMenu();
              tableReport.onPrint();
            }}
          >
            <ListItemIcon>
              {tableReport.isPrinting ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <PrintOutlined fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>Печать</ListItemText>
          </MenuItem>
        )}

        {tableReport && (
          <MenuItem
            disabled={tableReport.disabled || tableReport.isExporting}
            onClick={() => {
              closeMenu();
              tableReport.onExport();
            }}
          >
            <ListItemIcon>
              {tableReport.isExporting ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <DownloadOutlined fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>Экспорт CSV</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <AddTaskDialog
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />
    </>
  );
};
