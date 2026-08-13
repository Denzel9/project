import { FilterList } from '@mui/icons-material';
import { IconButton } from '@mui/material';

export const filteredColumnLabelSx = {
  color: 'primary.main',
  fontWeight: 600,
  '&:hover, &:focus, &.Mui-active, &.Mui-active:hover': {
    color: 'primary.main',
  },
} as const;

type PartnersColumnFilterButtonProps = {
  active?: boolean;
  open?: boolean;
  title: string;
  onClick: () => void;
};

export const PartnersColumnFilterButton = ({
  active = false,
  open = false,
  title,
  onClick,
}: PartnersColumnFilterButtonProps) => (
  <IconButton
    size="small"
    color={active || open ? 'primary' : 'default'}
    aria-label={`Фильтр: ${title}`}
    aria-expanded={open}
    onClick={event => {
      event.stopPropagation();
      onClick();
    }}
    sx={{
      p: 0.5,
      ...(open && {
        bgcolor: 'action.selected',
      }),
    }}
  >
    <FilterList sx={{ fontSize: 18 }} />
  </IconButton>
);
