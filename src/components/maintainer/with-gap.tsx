import React from 'react';
import { ApiGapIcon } from './ApiGapIcon';
import type { ApiGapKey } from './api-gaps';

/** A label followed by the API-gap icon, for Descriptions items, Statistic titles and table headers. */
export const withGap = (label: React.ReactNode, gap: ApiGapKey) => (
  <span>
    {label}
    <ApiGapIcon gap={gap} />
  </span>
);
