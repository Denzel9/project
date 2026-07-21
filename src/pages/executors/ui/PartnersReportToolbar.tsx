import { DownloadOutlined, PrintOutlined } from '@mui/icons-material';
import { Button, CircularProgress, IconButton, Stack } from '@mui/material';

type PartnersReportToolbarProps = {
  disabled?: boolean;
  isExporting?: boolean;
  onPrint: () => void;
  onExport: () => void;
};

export const PartnersReportToolbar = ({
  disabled = false,
  isExporting = false,
  onPrint,
  onExport,
}: PartnersReportToolbarProps) => (
  <Stack
    spacing={1}
    direction="row"
    className="partners-no-print"
  >
    <Button
      size="small"
      onClick={onPrint}
      variant="outlined"
      disabled={disabled}
      startIcon={<PrintOutlined />}
      sx={{ display: { xs: 'none', md: 'flex', textTransform: 'none' } }}
    >
      Печать
    </Button>

    <IconButton
      size="small"
      onClick={onPrint}
      disabled={disabled}
      sx={{ display: { xs: 'block', md: 'none' } }}
    >
      <PrintOutlined />
    </IconButton>

    <Button
      size="small"
      variant="outlined"
      startIcon={
        isExporting ? (
          <CircularProgress
            size={16}
            color="inherit"
          />
        ) : (
          <DownloadOutlined />
        )
      }
      onClick={onExport}
      disabled={disabled || isExporting}
      sx={{ display: { xs: 'none', md: 'flex', textTransform: 'none' } }}
    >
      Экспорт CSV
    </Button>

    <IconButton
      size="small"
      onClick={onExport}
      disabled={disabled || isExporting}
      sx={{ display: { xs: 'block', md: 'none' } }}
    >
      <DownloadOutlined />
    </IconButton>
  </Stack>
);
