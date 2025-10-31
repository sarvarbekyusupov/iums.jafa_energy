import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Table,
  message,
  Spin,
  Select,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { reportsService } from "../../../service";
import type {
  Report,
  ReportFilters,
  CreateReportDto,
} from "../../../types/api";
import { useAuth } from "../../../helpers/hooks/useAuth";

const { Title, Text } = Typography;

const { Option } = Select;

const ReportsManagement: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportTypes, setReportTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportPreview, setReportPreview] = useState<{
    html: string;
    data: any;
  } | null>(null);
  const [generatingReports, setGeneratingReports] = useState<Set<number>>(
    new Set()
  );
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(
    new Set()
  );
  const [form] = Form.useForm();

  useEffect(() => {
    fetchReports();
    fetchReportTypes();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsData = await reportsService.getAllReports(filters);
      setReports(reportsData);
    } catch (error: any) {
      console.error("Failed to fetch reports:", error);
      if (error?.response?.status === 404) {
        message.warning(
          "Reports API endpoint not yet implemented on the backend"
        );
      } else {
        message.error(
          "Failed to fetch reports: " + (error?.message || "Unknown error")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const typesData = await reportsService.getReportTypes();
      if (typesData.reportTypes && typesData.reportTypes.length > 0) {
        setReportTypes(typesData.reportTypes);
      } else {
        // Fallback to default report types from documentation
        setReportTypes([
          "energy",
          "device",
          "performance",
          "maintenance",
          "financial",
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch report types:", error);
      // Fallback to default report types from documentation
      setReportTypes([
        "energy",
        "device",
        "performance",
        "maintenance",
        "financial",
      ]);
    }
  };

  const handleGenerateReport = async (id: number) => {
    try {
      setGeneratingReports((prev) => new Set(prev).add(id));
      const result = await reportsService.generateReport(id);
      message.success(`Report generation started: ${result.message}`);

      // Simulate generation time (in real app, you'd poll for status)
      setTimeout(() => {
        setGeneratingReports((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        fetchReports(); // Refresh to update lastGenerated
        message.success("Report generation completed!");
      }, 3000);
    } catch (error: any) {
      setGeneratingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      message.error(
        "Failed to generate report: " + (error?.message || "Unknown error")
      );
    }
  };

  const handleViewReport = async (report: Report) => {
    if (!report.lastGenerated) {
      message.warning(
        "This report has not been generated yet. Please generate it first."
      );
      return;
    }

    try {
      setSelectedReport(report);
      setViewModalVisible(true);
      setReportPreview(null); // Clear previous preview

      // Load preview data
      const preview = await reportsService.getReportPreview(report.id);
      setReportPreview(preview);
    } catch (error: any) {
      console.error("Failed to load preview:", error);
      if (error?.response?.status === 404) {
        message.error("Report preview not available");
      } else {
        message.error("Failed to load report preview");
      }
    }
  };

  const handleDownloadReport = async (
    report: Report,
    format: "pdf" | "excel" | "csv" = "pdf"
  ) => {
    if (!report.lastGenerated) {
      message.warning(
        "This report has not been generated yet. Please generate it first."
      );
      return;
    }

    const downloadKey = `${report.id}-${format}`;

    try {
      setDownloadingReports((prev) => new Set(prev).add(downloadKey));

      // Show different messages based on format (PDF takes longer)
      if (format === "pdf") {
        message.loading("Generating PDF... This may take a few seconds.", 0);
      } else {
        message.loading(`Preparing ${format.toUpperCase()} download...`, 0);
      }

      const blob = await reportsService.downloadReport(report.id, format);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0];
      const fileName = `${report.name.replace(/\s+/g, "_")}_${date}.${format}`;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);
      message.destroy(); // Clear loading message
      message.success(`${format.toUpperCase()} downloaded successfully!`);
    } catch (error: any) {
      message.destroy(); // Clear loading message
      console.error("Download failed:", error);

      if (error?.response?.status === 404) {
        message.error("Report not found or has been deleted");
      } else if (error?.response?.status === 500) {
        message.error("Report generation failed. Please try again.");
      } else {
        message.error(`Download failed: ${error?.message || "Unknown error"}`);
      }
    } finally {
      setDownloadingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      await reportsService.deleteReport(id);
      message.success("Report deleted successfully");
      fetchReports();
    } catch (error: any) {
      message.error(
        "Failed to delete report: " + (error?.message || "Unknown error")
      );
    }
  };

  const handleCreateReport = async (values: any) => {
    try {
      const reportData: CreateReportDto = {
        name: values.name,
        description: values.description,
        reportType: values.reportType,
        createdBy: user?.id || 1,
        parameters: {
          siteId: values.siteId || 1,
          from:
            values.dateRange?.from || new Date().toISOString().split("T")[0],
          to: values.dateRange?.to || new Date().toISOString().split("T")[0],
          metrics: values.metrics || [
            "production",
            "consumption",
            "efficiency",
          ],
        },
        isPublic: values.isPublic || false,
        schedule: values.enableSchedule
          ? {
              frequency: values.frequency || "monthly",
              enabled: true,
            }
          : undefined,
      };

      await reportsService.createReport(reportData);
      message.success("Report created successfully");
      setCreateModalVisible(false);
      form.resetFields();
      fetchReports();
    } catch (error: any) {
      message.error(
        "Failed to create report: " + (error?.message || "Unknown error")
      );
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "reportType",
      key: "reportType",
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "No description",
    },
    {
      title: "Public",
      dataIndex: "isPublic",
      key: "isPublic",
      render: (isPublic: boolean) => (
        <Text type={isPublic ? "success" : "secondary"}>
          {isPublic ? "Yes" : "No"}
        </Text>
      ),
    },
    {
      title: "Last Generated",
      dataIndex: "lastGenerated",
      key: "lastGenerated",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "Never",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Report) => (
        <Space wrap>
          <Tooltip
            title={
              generatingReports.has(record.id)
                ? "Generating..."
                : "Generate Report"
            }
          >
            <Button
              type="text"
              icon={
                generatingReports.has(record.id) ? (
                  <LoadingOutlined />
                ) : (
                  <DownloadOutlined />
                )
              }
              onClick={() => handleGenerateReport(record.id)}
              loading={generatingReports.has(record.id)}
              disabled={generatingReports.has(record.id)}
            >
              Generate
            </Button>
          </Tooltip>

          <Tooltip title="View Report">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewReport(record)}
              disabled={!record.lastGenerated}
            >
              View
            </Button>
          </Tooltip>

          <Tooltip title="Download PDF">
            <Button
              type="text"
              icon={
                downloadingReports.has(`${record.id}-pdf`) ? (
                  <LoadingOutlined />
                ) : (
                  <FilePdfOutlined />
                )
              }
              onClick={() => handleDownloadReport(record, "pdf")}
              disabled={
                !record.lastGenerated ||
                downloadingReports.has(`${record.id}-pdf`)
              }
              loading={downloadingReports.has(`${record.id}-pdf`)}
            >
              PDF
            </Button>
          </Tooltip>

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => message.info("Edit functionality coming soon")}
          >
            Edit
          </Button>

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteReport(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <FileTextOutlined style={{ color: "#52c41a" }} />
            Reports Management
          </Title>
          <Text type="secondary">Create and manage custom reports</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Create New Report
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Space>
            <Select
              placeholder="Filter by Report Type"
              style={{ width: 200 }}
              allowClear
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, reportType: value }))
              }
            >
              {reportTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Visibility"
              style={{ width: 150 }}
              allowClear
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, isPublic: value }))
              }
            >
              <Option value={true}>Public</Option>
              <Option value={false}>Private</Option>
            </Select>
          </Space>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Loading reports...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={reports}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: "No reports found",
            }}
            scroll={{ x: "max-content" }}
          />
        )}
      </Card>

      {/* Create Report Modal */}
      <Modal
        title="Create New Report"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateReport}>
          <Form.Item
            name="name"
            label="Report Name"
            rules={[{ required: true, message: "Please enter report name" }]}
          >
            <Input placeholder="Enter report name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Enter report description" rows={3} />
          </Form.Item>

          <Form.Item
            name="reportType"
            label="Report Type"
            rules={[{ required: true, message: "Please select report type" }]}
          >
            <Select placeholder="Select report type">
              {reportTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="siteId" label="Site ID" initialValue={1}>
            <Input type="number" placeholder="Enter site ID" />
          </Form.Item>

          <Form.Item
            name="isPublic"
            label="Public Report"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="enableSchedule"
            label="Enable Scheduling"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.enableSchedule !== currentValues.enableSchedule
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("enableSchedule") ? (
                <Form.Item name="frequency" label="Schedule Frequency">
                  <Select placeholder="Select frequency">
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="yearly">Yearly</Option>
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* View Report Modal */}
      <Modal
        title={`View Report: ${selectedReport?.name || ""}`}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedReport(null);
          setReportPreview(null);
        }}
        width={800}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setViewModalVisible(false);
              setSelectedReport(null);
              setReportPreview(null);
            }}
          >
            Close
          </Button>,
          <Button
            key="download-csv"
            icon={
              downloadingReports.has(`${selectedReport?.id}-csv`) ? (
                <LoadingOutlined />
              ) : (
                <DownloadOutlined />
              )
            }
            onClick={() =>
              selectedReport && handleDownloadReport(selectedReport, "csv")
            }
            loading={downloadingReports.has(`${selectedReport?.id}-csv`)}
          >
            Download CSV
          </Button>,
          <Button
            key="download-excel"
            icon={
              downloadingReports.has(`${selectedReport?.id}-excel`) ? (
                <LoadingOutlined />
              ) : (
                <DownloadOutlined />
              )
            }
            onClick={() =>
              selectedReport && handleDownloadReport(selectedReport, "excel")
            }
            loading={downloadingReports.has(`${selectedReport?.id}-excel`)}
          >
            Download Excel
          </Button>,
          <Button
            key="download-pdf"
            type="primary"
            icon={
              downloadingReports.has(`${selectedReport?.id}-pdf`) ? (
                <LoadingOutlined />
              ) : (
                <FilePdfOutlined />
              )
            }
            onClick={() =>
              selectedReport && handleDownloadReport(selectedReport, "pdf")
            }
            loading={downloadingReports.has(`${selectedReport?.id}-pdf`)}
          >
            Download PDF
          </Button>,
        ]}
      >
        {selectedReport && (
          <div style={{ padding: "16px 0" }}>
            <Card size="small" style={{ marginBottom: "16px" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <strong>Report Type:</strong>{" "}
                  <Tag color="blue">{selectedReport.reportType}</Tag>
                </div>
                <div>
                  <strong>Description:</strong>{" "}
                  {selectedReport.description || "No description"}
                </div>
                <div>
                  <strong>Last Generated:</strong>{" "}
                  {selectedReport.lastGenerated
                    ? new Date(selectedReport.lastGenerated).toLocaleString()
                    : "Never"}
                </div>
                <div>
                  <strong>Parameters:</strong>
                </div>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {JSON.stringify(selectedReport.parameters, null, 2)}
                </pre>
              </Space>
            </Card>

            <Card title="Report Preview" size="small">
              {reportPreview ? (
                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                    maxHeight: "400px",
                    overflow: "auto",
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: reportPreview.html }}
                    style={{
                      padding: "16px",
                      background: "white",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: "20px",
                    background: "#fafafa",
                    borderRadius: "4px",
                    minHeight: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center", color: "#666" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: "16px" }}>
                      Loading report preview...
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsManagement;
