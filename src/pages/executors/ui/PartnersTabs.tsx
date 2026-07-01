import { Box, Tab, Tabs } from '@mui/material';

import type { PartnersTab, PartnersTabId } from '../model/types';

type PartnersTabsProps = {
  tabs: PartnersTab[];
  value: PartnersTabId;
  onChange: (value: PartnersTabId) => void;
};

export const PartnersTabs = ({ tabs, value, onChange }: PartnersTabsProps) => (
  <Box
    sx={{
      mb: 2,
      bgcolor: 'white',
      borderRadius: { xs: '16px', md: '24px' },
      border: '1px solid',
      borderColor: 'divider',
      px: { xs: 1, md: 2 },
    }}
  >
    <Tabs
      value={value}
      onChange={(_, nextValue: PartnersTabId) => onChange(nextValue)}
      variant="scrollable"
      scrollButtons="auto"
    >
      {tabs.map(tab => (
        <Tab
          key={tab.id}
          value={tab.id}
          label={tab.label}
        />
      ))}
    </Tabs>
  </Box>
);
