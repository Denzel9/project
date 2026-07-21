import { Tab, Tabs } from '@mui/material';

import type { PartnersTab, PartnersTabId } from '../model/types';

type PartnersTabsProps = {
  tabs: PartnersTab[];
  value: PartnersTabId;
  onChange: (value: PartnersTabId) => void;
};

export const PartnersTabs = ({ tabs, value, onChange }: PartnersTabsProps) => (
  <Tabs
    value={value}
    sx={{ mb: 2 }}
    variant="scrollable"
    scrollButtons="auto"
    className="partners-no-print"
    onChange={(_, nextValue: PartnersTabId) => onChange(nextValue)}
  >
    {tabs.map(tab => (
      <Tab
        key={tab.id}
        value={tab.id}
        label={tab.label}
        sx={{ textTransform: 'none' }}
      />
    ))}
  </Tabs>
);
