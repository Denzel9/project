export const getSidebarItemButtonSx = (isExpanded: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: isExpanded ? 'flex-start' : 'center',
  px: isExpanded ? '32px !important' : '0 !important',
});

export const getSidebarItemIconSx = (isExpanded: boolean) => ({
  minWidth: isExpanded ? 40 : 0,
  justifyContent: isExpanded ? 'flex-start' : 'center',
  transition: 'min-width 0.3s ease',
  svg: {
    width: isExpanded ? 24 : 28,
    height: isExpanded ? 24 : 28,
    transition: 'width 0.3s ease, height 0.3s ease',
  },
});

export const getSidebarItemTextSx = (isExpanded: boolean) => ({
  m: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  opacity: isExpanded ? 1 : 0,
  flex: isExpanded ? '1 1 auto' : '0 0 0',
  width: isExpanded ? 'auto' : 0,
  minWidth: isExpanded ? 0 : 0,
  transition: 'opacity 0.3s ease, flex-basis 0.3s ease, width 0.3s ease',
  '& .MuiTypography-root': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const sidebarSubmenuIconSx = {
  minWidth: 40,
  width: 40,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'inherit',
  '& svg': {
    width: 24,
    height: 24,
  },
};
