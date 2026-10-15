import React from 'react';
import { Tooltip } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { useAuth } from '../../helpers/hooks/useAuth';
import { MAINTAINER_USER_ID } from '../layout/page-status';
import { API_GAPS, type ApiGapKey } from './api-gaps';

/**
 * A small purple plug after a field the vendor API does not fill (see api-gaps.ts). Only the
 * maintainer's account sees it; everyone else sees the page unchanged.
 */
export const ApiGapIcon: React.FC<{ gap: ApiGapKey }> = ({ gap }) => {
  const { user } = useAuth();
  if (user?.id !== MAINTAINER_USER_ID) return null;
  return (
    <Tooltip title={API_GAPS[gap].why}>
      <ApiOutlined aria-label="API bermaydi" style={{ color: '#722ed1', marginLeft: 6, fontSize: 12 }} />
    </Tooltip>
  );
};
