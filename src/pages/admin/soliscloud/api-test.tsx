import React, { useState } from 'react';
import { Card, Button, Space, message, Collapse, Tag, Descriptions, Spin } from 'antd';
import { ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';

const { Panel } = Collapse;

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  data?: any;
  error?: string;
  duration?: number;
}

const SolisCloudAPITest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const data = await testFn();
      const duration = Date.now() - startTime;
      return { name, status: 'success' as const, data, duration };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        name,
        status: 'error' as const,
        error: error?.response?.data?.msg || error.message,
        duration,
      };
    }
  };

  const testAllAPIs = async () => {
    setTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    message.info('Starting API tests...');

    // Section 1: Inverter APIs
    testResults.push(
      await runTest('Get Inverter List', () =>
        solisCloudService.getInverterList({ pageNo: 1, pageSize: 20 })
      )
    );

    // Get first inverter for detail tests
    const inverterList = testResults[0];
    let inverterId: string | undefined;
    let inverterSn: string | undefined;

    if (inverterList.status === 'success' && inverterList.data?.page?.records?.length > 0) {
      inverterId = inverterList.data.page.records[0].id;
      inverterSn = inverterList.data.page.records[0].sn;

      testResults.push(
        await runTest('Get Inverter Detail', () =>
          solisCloudService.getInverterDetail({ id: inverterId })
        )
      );

      testResults.push(
        await runTest('Get Inverter Day Data', () =>
          solisCloudService.getInverterDayData({
            sn: inverterSn!,
            time: new Date().toISOString().split('T')[0],
          })
        )
      );

      testResults.push(
        await runTest('Get Inverter Month Data', () =>
          solisCloudService.getInverterMonthData({
            sn: inverterSn!,
            month: new Date().toISOString().slice(0, 7),
          })
        )
      );

      testResults.push(
        await runTest('Get Inverter Year Data', () =>
          solisCloudService.getInverterYearData({
            sn: inverterSn!,
            year: new Date().getFullYear().toString(),
          })
        )
      );
    }

    testResults.push(
      await runTest('Get Alarm List', () =>
        solisCloudService.getAlarmList({ pageNo: 1, pageSize: 20 })
      )
    );

    // Section 2: Collector APIs
    testResults.push(
      await runTest('Get Collector List', () =>
        solisCloudService.getCollectorList({ pageNo: 1, pageSize: 20 })
      )
    );

    // Section 3: EPM APIs
    testResults.push(
      await runTest('Get EPM List', () =>
        solisCloudService.getEPMList({ pageNo: 1, pageSize: 20 })
      )
    );

    // Section 4: Weather APIs
    testResults.push(
      await runTest('Get Weather Station List', () =>
        solisCloudService.getWeatherStationList({ pageNo: 1, pageSize: 20 })
      )
    );

    // Section 5: Station APIs
    testResults.push(
      await runTest('Get Station List', () =>
        solisCloudService.getStationList({ pageNo: 1, pageSize: 20 })
      )
    );

    // Get first station for detail tests
    const stationList = testResults[testResults.length - 1];
    let stationId: string | undefined;

    if (stationList.status === 'success' && stationList.data?.records?.length > 0) {
      stationId = stationList.data.records[0].id;

      testResults.push(
        await runTest('Get Station Detail', () =>
          solisCloudService.getStationDetail({ id: stationId! })
        )
      );

      testResults.push(
        await runTest('Get Station Day Data', () =>
          solisCloudService.getStationDayData({
            id: stationId!,
            time: new Date().toISOString().split('T')[0],
            timeZone: 8,
          })
        )
      );

      testResults.push(
        await runTest('Get Station Month Data', () =>
          solisCloudService.getStationMonthData({
            id: stationId!,
            month: new Date().toISOString().slice(0, 7),
          })
        )
      );

      testResults.push(
        await runTest('Get Station Year Data', () =>
          solisCloudService.getStationYearData({
            id: stationId!,
            year: new Date().getFullYear().toString(),
          })
        )
      );

      testResults.push(
        await runTest('Get Station All Years Data', () =>
          solisCloudService.getStationAllYearsData({ id: stationId! })
        )
      );

      testResults.push(
        await runTest('Get Station Day List', () =>
          solisCloudService.getStationDayList({
            time: new Date().toISOString().split('T')[0],
            pageNo: 1,
            pageSize: 20,
          })
        )
      );
    }

    setResults(testResults);
    setTesting(false);

    const successCount = testResults.filter((r) => r.status === 'success').length;
    const totalCount = testResults.length;

    if (successCount === totalCount) {
      message.success(`All ${totalCount} API tests passed! ✅`);
    } else {
      message.warning(`${successCount}/${totalCount} API tests passed`);
    }
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            SolisCloud API Test Suite
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" onClick={testAllAPIs} loading={testing}>
              Run All Tests
            </Button>
          </Space>
        }
      >
        {results.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Space size="large">
              <Tag color="blue">Total: {results.length}</Tag>
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Success: {successCount}
              </Tag>
              <Tag color="red" icon={<CloseCircleOutlined />}>
                Error: {errorCount}
              </Tag>
            </Space>
          </div>
        )}

        <Spin spinning={testing} tip="Running API tests...">
          {results.length > 0 ? (
            <Collapse>
              {results.map((result, index) => (
                <Panel
                  key={index}
                  header={
                    <Space>
                      {result.status === 'success' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      )}
                      <span>{result.name}</span>
                      <Tag color={result.status === 'success' ? 'green' : 'red'}>
                        {result.duration}ms
                      </Tag>
                    </Space>
                  }
                >
                  {result.status === 'success' ? (
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="Status">
                        <Tag color="success">SUCCESS</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Duration">{result.duration}ms</Descriptions.Item>
                      <Descriptions.Item label="Response">
                        <pre style={{ maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="Status">
                        <Tag color="error">ERROR</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Duration">{result.duration}ms</Descriptions.Item>
                      <Descriptions.Item label="Error">
                        <Tag color="red">{result.error}</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Panel>
              ))}
            </Collapse>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              Click "Run All Tests" to start testing SolisCloud APIs
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default SolisCloudAPITest;
