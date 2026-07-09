import { Tab, Tabs } from '@mui/material';

import type { PartnersTab, PartnersTabId } from '../model/types';

type PartnersTabsProps = {
  tabs: PartnersTab[];
  value: PartnersTabId;
  onChange: (value: PartnersTabId) => void;
};

export const PartnersTabs = ({ tabs, value, onChange }: PartnersTabsProps) => (
  <Tabs
    className="partners-no-print"
    value={value}
    onChange={(_, nextValue: PartnersTabId) => onChange(nextValue)}
    variant="scrollable"
    scrollButtons="auto"
    sx={{ mb: 2 }}
  >
    {tabs.map(tab => (
      <Tab
        key={tab.id}
        value={tab.id}
        label={tab.label}
      />
    ))}
  </Tabs>
);
