import React, { useState, useEffect } from 'react';
import { 
  Card, 
  DatePicker, 
  Button, 
  Spin, 
  message, 
  Row, 
  Col, 
  Statistic, 
  Alert,
  Collapse,
  Table,
  Tag,
  Select,
  Switch,
  Empty
} from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  ReloadOutlined, 
  ThunderboltOutlined, 
  FireOutlined,
  BarChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { hopeCloudService } from '../service';
import type { 
  HopeCloudEquipmentHistoricalData, 
  HopeCloudEquipmentParameter,
  HopeCloudHistoricalOptions
} from '../types/hopecloud';
import DataAsOf from './DataAsOf';
import { toNumber } from '../helpers/hopecloud-fields';
import dayjs from 'dayjs';

const { Option } = Select;

const NO_STORED_DATA_TEXT = 'No stored history for this date yet. Run a backfill from Sync Data, or switch to Live HopeCloud.';

/** Newest `time` in a list of rows; the fallback freshness stamp when the API sends no dataAsOf. */
const newestTime = (rows: Array<{ time?: string }>): string | null =>
  rows.reduce<string | null>((max, row) => (row.time && (!max || row.time > max) ? row.time : max), null);

interface HopeCloudEquipmentHistoryProps {
  deviceSn: string;
  equipmentName?: string;
  inverterSn?: string;
  inverterId?: string;
  deviceId?: number; // Local database device ID
}

interface ProcessedParameter {
  time: string;
  [key: string]: number | string;
}

interface ParameterInfo {
  name: string;
  key: string;
  unit: string;
  color: string;
}

const HopeCloudEquipmentHistory: React.FC<HopeCloudEquipmentHistoryProps> = ({
  deviceSn,
  equipmentName,
  inverterSn,
  inverterId,
  deviceId
}) => {
  const [historicalData, setHistoricalData] = useState<HopeCloudEquipmentHistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, 'day'));
  // Data source: our database (default, works when the vendor API is down) or live HopeCloud.
  const [useDbSource, setUseDbSource] = useState(true);
  const [dataAsOf, setDataAsOf] = useState<string | null>(null);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([
    'ACActivePower',
    'DCInputPower',
    'internalTemperature',
    'inverterEfficiency'
  ]);
  const [syncing, setSyncing] = useState(false);

  // Keys exactly as the inverter sends them in paramList (case matters: ACActivePower, not
  // acActivePower, which matched nothing and left the chart empty)
  const keyParameters: ParameterInfo[] = [
    { name: 'AC Active Power', key: 'ACActivePower', unit: 'kW', color: '#1890ff' },
    { name: 'DC Input Power', key: 'DCInputPower', unit: 'kW', color: '#52c41a' },
    { name: 'Internal Temperature', key: 'internalTemperature', unit: '℃', color: '#fa8c16' },
    { name: 'Inverter Efficiency', key: 'inverterEfficiency', unit: '%', color: '#722ed1' },
    { name: 'Daily Electricity', key: 'dayElectricity', unit: 'kWh', color: '#13c2c2' },
    { name: 'Total Electricity', key: 'totalGeneratingCapacity', unit: 'kWh', color: '#eb2f96' },
    { name: 'Grid Frequency', key: 'gridFrequency', unit: 'Hz', color: '#2f54eb' },
    { name: 'Grid AB Line Voltage', key: 'gridABLineVoltage', unit: 'V', color: '#fa541c' },
    { name: 'Grid BC Line Voltage', key: 'gridBCLineVoltage', unit: 'V', color: '#f5222d' },
    { name: 'Grid CA Line Voltage', key: 'gridCALineVoltage', unit: 'V', color: '#a0d911' }
  ];

  const handleResyncDevice = async () => {
    setSyncing(true);
    try {
      const options: any = {
        skipReadings: true // Fast mode - only sync daily statistics
      };

      // If we have a local device ID, resync that specific device
      if (deviceId) {
        options.deviceIds = [deviceId];
      }
      // Otherwise, resync all devices (fallback)

      const response = await hopeCloudService.resyncDevices(options);

      if (response.status === 'success') {
        message.success(
          deviceId
            ? 'Device data synced successfully from HopeCloud'
            : 'All devices synced successfully from HopeCloud'
        );
        // Refresh the displayed data after sync
        await fetchEquipmentData();
      } else {
        throw new Error(response.message || 'Failed to sync device data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sync device data';
      message.error(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  const fetchEquipmentData = async () => {
    if (!deviceSn) return;

    setLoading(true);
    setError(null);

    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const options: HopeCloudHistoricalOptions = {};

      if (inverterSn) options.sn = inverterSn;
      if (inverterId) options.id = inverterId;

      const response = useDbSource
        ? await hopeCloudService.getDbEquipmentHistoricalData(deviceSn, dateString, options)
        : await hopeCloudService.getEquipmentHistoricalData(deviceSn, dateString, options);

      if (response.status === 'success' && response.data) {
        setHistoricalData(response.data);
        // dataAsOf only exists on the /hopecloud/db responses; the live types do not declare it
        setDataAsOf((response as { dataAsOf?: string | null }).dataAsOf || newestTime(response.data));
      } else {
        throw new Error('Failed to fetch equipment historical data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch equipment historical data';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentData();
  }, [deviceSn, selectedDate, inverterSn, inverterId, useDbSource]);

  const extractParameters = (parameterKeys: string[]): ProcessedParameter[] => {
    return historicalData.map(entry => {
      const processed: ProcessedParameter = {
        time: dayjs(entry.time).format('HH:mm')
      };

      parameterKeys.forEach(key => {
        // Values arrive as strings ("9.98"); the chart needs numbers
        const value = toNumber(entry.paramList?.find(p => p.key === key)?.value);
        if (value !== undefined) {
          processed[key] = value;
        }
      });

      return processed;
    });
  };

  const getParameterStats = (parameterKey: string) => {
    const values = historicalData
      .map(entry => toNumber(entry.paramList?.find(p => p.key === parameterKey)?.value))
      .filter((v): v is number => v !== undefined);

    if (values.length === 0) return null;

    return {
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      latest: values[values.length - 1]
    };
  };

  // The newest reading of the day (the list starts at the first one)
  const getAllParameters = (): HopeCloudEquipmentParameter[] => {
    if (!historicalData.length) return [];
    const latest = historicalData.reduce((a, b) => ((b.time || '') >= (a.time || '') ? b : a));
    return latest.paramList || [];
  };

  const chartData = extractParameters(selectedParameters);
  const allParameters = getAllParameters();

  const renderParameterChart = () => {
    if (!chartData.length) return null;

    const selectedParamInfo = keyParameters.filter(p => selectedParameters.includes(p.key));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => {
              const paramInfo = selectedParamInfo.find(p => p.name === name || p.key === name);
              return [
                `${typeof value === 'number' ? value.toFixed(2) : value} ${paramInfo?.unit || ''}`,
                paramInfo?.name || name
              ];
            }}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend />
          {selectedParamInfo.map((param) => (
            <Line
              key={param.key}
              type="monotone"
              dataKey={param.key}
              stroke={param.color}
              name={param.name}
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderStatistics = () => {
    const stats = selectedParameters.map(key => {
      const paramInfo = keyParameters.find(p => p.key === key);
      const stats = getParameterStats(key);
      return { paramInfo, stats };
    }).filter(item => item.stats);

    return (
      <Row gutter={[16, 16]}>
        {stats.map(({ paramInfo, stats }) => (
          <Col span={6} key={paramInfo?.key}>
            <Card size="small">
              <Statistic
                title={paramInfo?.name}
                value={stats?.latest}
                suffix={paramInfo?.unit}
                prefix={
                  paramInfo?.key === 'ACActivePower' ? <ThunderboltOutlined /> :
                  paramInfo?.key === 'internalTemperature' ? <FireOutlined /> :
                  <BarChartOutlined />
                }
                precision={2}
                valueStyle={{ color: paramInfo?.color }}
              />
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Max: {stats?.max.toFixed(2)} | Avg: {stats?.avg.toFixed(2)}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div>
      <Card
        title={`Equipment Historical Data - ${equipmentName || deviceSn}`}
        extra={
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {useDbSource && <DataAsOf timestamp={dataAsOf} compact />}
            <Switch
              checked={useDbSource}
              onChange={setUseDbSource}
              checkedChildren="Stored data"
              unCheckedChildren="Live HopeCloud"
            />
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > dayjs().subtract(1, 'day')}
              style={{ width: 150 }}
            />
            <Button
              icon={<DatabaseOutlined />}
              onClick={handleResyncDevice}
              loading={syncing}
            >
              Sync from HopeCloud
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchEquipmentData}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {error && (
          <Alert
            message="Error Loading Equipment Historical Data"
            description={error}
            type="error"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading equipment data...</div>
          </div>
        ) : historicalData.length > 0 ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>Select Parameters to Display:</label>
              <Select
                mode="multiple"
                placeholder="Select parameters"
                value={selectedParameters}
                onChange={setSelectedParameters}
                style={{ width: '100%', marginTop: 8 }}
              >
                {keyParameters.map(param => (
                  <Option key={param.key} value={param.key}>
                    {param.name} ({param.unit})
                  </Option>
                ))}
              </Select>
            </div>

            {renderStatistics()}

            <Card 
              title={`Parameters Over Time - ${selectedDate.format('YYYY-MM-DD')}`} 
              size="small"
              style={{ marginTop: 16 }}
            >
              {renderParameterChart()}
            </Card>

            <Collapse 
              style={{ marginTop: 16 }}
              items={[
                {
                  key: 'all-parameters',
                  label: (
                    <span>
                      <DatabaseOutlined /> All Parameters (Latest Reading) - {allParameters.length} parameters
                    </span>
                  ),
                  children: (
                    <Table
                      size="small"
                      dataSource={allParameters}
                      rowKey={(_, index) => `param-${index}`}
                      columns={[
                        {
                          title: 'Parameter Name',
                          dataIndex: 'name',
                          key: 'name',
                          width: '40%',
                        },
                        {
                          title: 'Value',
                          dataIndex: 'value',
                          key: 'value',
                          // Text parameters (inverterState, versions) are strings; .toFixed on them
                          // crashed the whole modal
                          render: (value: unknown) => {
                            if (value === null || value === undefined || value === '') return '-';
                            return typeof value === 'number' ? value.toFixed(2) : String(value);
                          }
                        },
                        {
                          title: 'Unit',
                          dataIndex: 'unit',
                          key: 'unit',
                          render: (unit: string) => (unit ? <Tag color="blue">{unit}</Tag> : null)
                        },
                        {
                          title: 'Key',
                          dataIndex: 'key',
                          key: 'paramKey',
                          render: (key: string) => <code style={{ fontSize: 11 }}>{key}</code>
                        }
                      ]}
                      pagination={{ pageSize: 20 }}
                    />
                  )
                }
              ]}
            />
          </>
        ) : useDbSource && !error ? (
          <Empty description={NO_STORED_DATA_TEXT} style={{ padding: '50px 0' }} />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>No equipment data available for {selectedDate.format('YYYY-MM-DD')}</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HopeCloudEquipmentHistory;