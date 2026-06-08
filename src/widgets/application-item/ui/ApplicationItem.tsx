import { MoreVert, Share } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Rating,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router';

import { BASE_COLOR } from '@/app/index';
import { ROUTES } from '@/shared/index';
import { Media } from '@/widgets';

import { useActions } from '../model/hooks/useActions';

import { Action } from './Action';

import type { ApplicationItemProps } from '../model/types';

const ApplicationItem = ({
  item,
  permissions = [],
  isMyApplication = false,
  // isFavorite = false,
}: ApplicationItemProps) => {
  const { allowedActions, handleAction } = useActions({
    permissions,
    id: item.toString(),
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [isApplied, setIsApplied] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Link
      target="_blank"
      to={`${ROUTES.APPLICATION}/${item}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Box
        sx={{
          p: 4,
          gap: 4,
          width: '100%',
          display: 'flex',
          cursor: 'pointer',
          borderRadius: '32px',
          transition: 'all 0.3s ease',
          border: theme => `1px solid ${theme.palette.secondary.main}`,
          borderLeft: theme =>
            isApplied
              ? `4px solid ${theme.palette.primary.main}`
              : `1px solid ${theme.palette.secondary.main}`,
          '&:hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Media width={400} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
              }}
            >
              <Box>
                <Typography variant="h6">UGC Creator</Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip label="Professional" />
                  <Chip label="Verified" />
                  <Chip label="Offline" />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box>
                  <IconButton onClick={e => e.preventDefault()}>
                    <Share />
                  </IconButton>
                </Box>

                <IconButton onClick={handleClick}>
                  <MoreVert />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  {allowedActions.map(action => (
                    <MenuItem
                      key={action.key}
                      onClick={e => {
                        e.preventDefault();
                        handleAction(action.key);
                      }}
                    >
                      {action.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Link
                target="_blank"
                // TODO: Add id
                to={`${ROUTES.PROFILE}?userId=fbe15db7-3543-4ec6-8911-016a5bb93b2b`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography variant="h6">Caudalie</Typography>
              </Link>

              <Rating
                readOnly
                value={4.5}
                precision={0.5}
              />

              <Typography
                variant="body1"
                sx={{ mt: 4 }}
              >
                Мы помогаем ускорить цифровую трансформацию с помощью гибких и
                быстроадаптируемых решений мирового уровня: современных
                ИТ-продуктов, систем работы с большими данными и комплексных
                решений для фронт- и бэк-офисов. Наши разработки повышают
                гибкость и эффективность работы банковских команд.{' '}
                <span
                  style={{
                    color: BASE_COLOR,
                    cursor: 'pointer',
                  }}
                >
                  Подробнее
                </span>
              </Typography>

              {item % 2 === 0 && (
                <Typography
                  variant="body1"
                  sx={{ mt: 4 }}
                >
                  Moscow, Russia
                </Typography>
              )}
            </Box>
          </Box>

          {!isMyApplication && (
            <Action
              isApplied={isApplied}
              setIsApplied={setIsApplied}
            />
          )}
        </Box>
      </Box>
    </Link>
  );
};

export default ApplicationItem;
