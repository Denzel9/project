import { Box, Chip, Stack } from '@mui/material';
import { useState } from 'react';

import {
  PlacementFormatEnum,
  PlatformEnum,
  type PlacementFormat,
  type Platform,
  getPlacementFormatLabel,
  getPlatformLabel,
} from '@/entities/post';

const PLATFORM_OPTIONS = Object.values(PlatformEnum);
const FORMAT_OPTIONS = Object.values(PlacementFormatEnum);

type DeliverablePresetChipsProps = {
  onAdd: (platform: Platform, format: PlacementFormat) => void;
};

export const DeliverablePresetChips = ({
  onAdd,
}: DeliverablePresetChipsProps) => {
  const [presetPlatform, setPresetPlatform] = useState<Platform | null>(null);

  const handlePlatformClick = (platform: Platform) => {
    setPresetPlatform(prev => (prev === platform ? null : platform));
  };

  const handleFormatClick = (format: PlacementFormat) => {
    if (!presetPlatform) return;

    onAdd(presetPlatform, format);
    setPresetPlatform(null);
  };

  return (
    <Stack>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, mt: 2 }}>
        {PLATFORM_OPTIONS.map(platform => (
          <Chip
            key={platform}
            clickable
            label={getPlatformLabel(platform)}
            color={presetPlatform === platform ? 'primary' : 'default'}
            onClick={() => handlePlatformClick(platform)}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {FORMAT_OPTIONS.map(format => (
          <Chip
            key={format}
            clickable
            label={getPlacementFormatLabel(format)}
            disabled={!presetPlatform}
            onClick={() => handleFormatClick(format)}
          />
        ))}
      </Box>
    </Stack>
  );
};
