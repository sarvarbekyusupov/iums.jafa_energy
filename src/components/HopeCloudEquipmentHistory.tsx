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
  Select
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
import dayjs from 'dayjs';

const { Option } = Select;

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
  const [selectedParameters, setSelectedParameters] = useState<string[]>([
    'acActivePower',
    'dcInputPower',
    'internalTemperature',
    'inverterEfficiency'
  ]);
  const [syncing, setSyncing] = useState(false);

  const keyParameters: ParameterInfo[] = [
    { name: 'AC Active Power', key: 'acActivePower', unit: 'kW', color: '#1890ff' },
    { name: 'DC Input Power', key: 'dcInputPower', unit: 'kW', color: '#52c41a' },
    { name: 'Internal Temperature', key: 'internalTemperature', unit: '℃', color: '#fa8c16' },
    { name: 'Inverter Efficiency', key: 'inverterEfficiency', unit: '%', color: '#722ed1' },
    { name: 'Daily Electricity', key: 'dailyElectricity', unit: 'kWh', color: '#13c2c2' },
    { name: 'Total Electricity', key: 'totalElectricity', unit: 'kWh', color: '#eb2f96' },
    { name: 'Grid BC Line Voltage', key: 'gridBCLineVoltage', unit: 'V', color: '#f5222d' }
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

      const response = await hopeCloudService.getEquipmentHistoricalData(deviceSn, dateString, options);

      if (response.status === 'success' && response.data) {
        setHistoricalData(response.data);
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
  }, [deviceSn, selectedDate, inverterSn, inverterId]);

  const extractParameters = (parameterKeys: string[]): ProcessedParameter[] => {
    return historicalData.map(entry => {
      const processed: ProcessedParameter = {
        time: dayjs(entry.time).format('HH:mm')
      };

      parameterKeys.forEach(key => {
        const param = entry.paramList?.find(p => p.key === key);
        if (param) {
          processed[key] = param.value;
        }
      });

      return processed;
    });
  };

  const getParameterStats = (parameterKey: string) => {
    const values = historicalData
      .map(entry => entry.paramList?.find(p => p.key === parameterKey)?.value)
      .filter(v => v !== undefined) as number[];

    if (values.length === 0) return null;

    return {
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      latest: values[values.length - 1]
    };
  };

  const getAllParameters = (): HopeCloudEquipmentParameter[] => {
    if (!historicalData.length) return [];
    return historicalData[0].paramList || [];
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
              const paramInfo = selectedParamInfo.find(p => p.key === name);
              return [
                `${value.toFixed(2)} ${paramInfo?.unit || ''}`,
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
                  paramInfo?.key === 'acActivePower' ? <ThunderboltOutlined /> :
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
                          render: (value: number) => value?.toFixed(2) || 'N/A'
                        },
                        {
                          title: 'Unit',
                          dataIndex: 'unit',
                          key: 'unit',
                          render: (unit: string) => <Tag color="blue">{unit}</Tag>
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