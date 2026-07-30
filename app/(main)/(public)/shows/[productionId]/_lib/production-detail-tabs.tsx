'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { type ReactNode } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

interface ProductionDetailTabsProps {
  auditionInfo: ReactNode;
  basicInfo: ReactNode;
}

// react-bootstrap's <Tabs> is 'use client'-only itself (it calls the
// `uncontrollable` hook internally), so the tab shell has to be a client
// island. `basicInfo`/`auditionInfo` are passed in as already-rendered
// Server Component output (see page.tsx) — only which pane is visible is
// client state, everything inside both panes is still server-rendered HTML
// present on first paint.
//
// Tab selection is kept in `?tab=`, matching the legacy client route
// (src/routes/PublicShowDetail.tsx), so a deep link to the audition-info tab
// still works. `router.replace` (not `push`) avoids stacking a history entry
// per tab click.
const ProductionDetailTabs: React.FC<ProductionDetailTabsProps> = ({
  auditionInfo,
  basicInfo
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'basic';

  const handleSelect = (key: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', key || 'basic');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      activeKey={activeTab}
      className="mb-3 overflow-x-auto overflow-y-hidden border-b border-paginationGray [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
      id="public-show-detail"
      onSelect={handleSelect}
    >
      <Tab eventKey="basic" title="Basic Info">
        {basicInfo}
      </Tab>
      <Tab eventKey="audition" title="Audition Info">
        {auditionInfo}
      </Tab>
    </Tabs>
  );
};

export default ProductionDetailTabs;
