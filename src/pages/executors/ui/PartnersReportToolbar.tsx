import { DownloadOutlined, PrintOutlined } from '@mui/icons-material';
import { Button, CircularProgress, Stack } from '@mui/material';

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
    direction="row"
    spacing={1}
    className="partners-no-print"
    sx={{ flexShrink: 0 }}
  >
    <Button
      size="small"
      variant="outlined"
      startIcon={<PrintOutlined />}
      disabled={disabled}
      onClick={onPrint}
    >
      Печать
    </Button>

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
      disabled={disabled || isExporting}
      onClick={onExport}
    >
      Экспорт CSV
    </Button>
  </Stack>
);
