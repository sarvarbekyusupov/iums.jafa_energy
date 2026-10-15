import { Tag } from 'antd';
import type { VendorKey } from '../../../types/availability';

/** The vendor of a station or inverter, as a coloured tag. */
export const providerTag = (p: VendorKey) =>
  p === 'hopecloud' ? (
    <Tag color="blue">HopeCloud</Tag>
  ) : p === 'huawei' ? (
    <Tag color="red">Huawei</Tag>
  ) : (
    <Tag color="orange">SolisCloud</Tag>
  );
