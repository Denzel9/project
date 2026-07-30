import { DownloadOutlined, PrintOutlined } from '@mui/icons-material';
import { CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';

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
    <Tooltip title="Печать">
      <IconButton
        size="small"
        disabled={disabled}
        onClick={onPrint}
      >
        {isExporting ? (
          <CircularProgress
            size={16}
            color="inherit"
          />
        ) : (
          <PrintOutlined fontSize="small" />
        )}
      </IconButton>
    </Tooltip>

    <Tooltip title="Экспорт CSV">
      <IconButton
        size="small"
        disabled={disabled || isExporting}
        onClick={onExport}
      >
        {isExporting ? (
          <CircularProgress
            size={16}
            color="inherit"
          />
        ) : (
          <DownloadOutlined fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  </Stack>
);
