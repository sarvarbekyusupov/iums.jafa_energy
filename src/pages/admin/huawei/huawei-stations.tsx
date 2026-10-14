import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  huaweiService,
  type HuaweiAlarmRow,
  type HuaweiStationRow,
} from "../../../service/huawei.service";
import { formatKwh } from "../../../helpers/currency";

const { Text } = Typography;
const TASHKENT_MS = 5 * 3_600_000;

/** Tashkent wall time whatever the viewer's own clock is set to: "15.10 14:30". */
const formatTime = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(new Date(iso).getTime() + TASHKENT_MS).toISOString();
  return `${d.slice(8, 10)}.${d.slice(5, 7)} ${d.slice(11, 16)}`;
};

const DEVICE_TYPE: Record<number, string> = {
  1: "Invertor",
  38: "Invertor",
  62: "Dongle",
  47: "Hisoblagich",
  17: "Hisoblagich",
  39: "Batareya",
};

const LEVEL: Record<number, { text: string; color: string }> = {
  1: { text: "Jiddiy", color: "red" },
  2: { text: "Muhim", color: "volcano" },
  3: { text: "Kichik", color: "orange" },
  4: { text: "Ogohlantirish", color: "gold" },
};

const health = (state: number | null) => {
  if (state === 3) return <Tag color="green">Sog'lom</Tag>;
  if (state === 2) return <Tag color="red">Nosoz</Tag>;
  if (state === 1) return <Tag color="default">Aloqa yo'q</Tag>;
  return <Tag>—</Tag>;
};

const HuaweiStations: React.FC = () => {
  const [rows, setRows] = useState<HuaweiStationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    huaweiService
      .getStations()
      .then((data) => setRows(data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnsType<HuaweiStationRow> = [
    {
      title: "Stansiya",
      dataIndex: "name",
      render: (name: string, s) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {s.plantCode}
            {s.address ? ` · ${s.address}` : ""}
          </Text>
        </Space>
      ),
    },
    {
      title: "Holat",
      dataIndex: "healthState",
      render: (v: number | null) => health(v),
    },
    {
      title: "Alarmlar",
      dataIndex: "activeAlarms",
      render: (alarms?: HuaweiAlarmRow[]) =>
        alarms?.length ? (
          <Tag color="red">{alarms.length} ta faol</Tag>
        ) : (
          <Text type="secondary">yo'q</Text>
        ),
    },
    {
      title: "Bugun",
      dataIndex: "dayKwh",
      render: (v: string | null) => formatKwh(v, 1),
    },
    {
      title: "Shu oy",
      dataIndex: "monthKwh",
      render: (v: string | null) => formatKwh(v),
    },
    {
      title: "Shu yil",
      dataIndex: "yearKwh",
      render: (v: string | null) => formatKwh(v),
    },
    {
      title: "Jami",
      dataIndex: "totalKwh",
      render: (v: string | null) => formatKwh(v),
    },
    {
      title: "Yangilangan",
      dataIndex: "kpiAt",
      render: (v: string | null) => (
        <Tooltip title="Huawei'dan oxirgi marta o'qilgan vaqt (Toshkent)">
          <Text type="secondary">{formatTime(v)}</Text>
        </Tooltip>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "minmax(0, 1fr)",
      }}
    >
      <Typography.Title level={3} style={{ margin: 0 }}>
        Huawei stansiyalari
      </Typography.Title>
      {failed && (
        <Alert
          type="error"
          showIcon
          message="Ma'lumotni olib bo'lmadi. Sahifani yangilab ko'ring."
        />
      )}
      <Spin spinning={loading}>
        <Card size="small" styles={{ body: { padding: 0 } }}>
          <Table<HuaweiStationRow>
            rowKey="plantCode"
            dataSource={rows}
            columns={columns}
            pagination={false}
            scroll={{ x: 760 }}
            expandable={{
              expandedRowRender: (s) => (
                <div style={{ display: "grid", gap: 12 }}>
                  {s.activeAlarms?.length ? (
                    <Table<HuaweiAlarmRow>
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={s.activeAlarms}
                      columns={[
                        {
                          title: "Alarm",
                          dataIndex: "alarmName",
                          render: (v: string, a) => (
                            <Space direction="vertical" size={0}>
                              <Text strong>{v}</Text>
                              {a.cause && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {a.cause}
                                </Text>
                              )}
                            </Space>
                          ),
                        },
                        {
                          title: "Daraja",
                          dataIndex: "level",
                          render: (l: number) => (
                            <Tag color={LEVEL[l]?.color}>
                              {LEVEL[l]?.text ?? l}
                            </Tag>
                          ),
                        },
                        {
                          title: "Qurilma",
                          dataIndex: "sn",
                          render: (v: string | null, a) =>
                            v ?? a.devName ?? "—",
                        },
                        {
                          title: "Boshlangan",
                          dataIndex: "raiseTime",
                          render: (v: string) => formatTime(v),
                        },
                        {
                          title: "Tavsiya",
                          dataIndex: "repairSuggestion",
                          render: (v: string | null) => (
                            <Text style={{ fontSize: 12 }}>{v ?? "—"}</Text>
                          ),
                        },
                      ]}
                    />
                  ) : null}
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={s.devices}
                    columns={[
                      {
                        title: "Qurilma",
                        dataIndex: "devTypeId",
                        render: (t: number) => DEVICE_TYPE[t] ?? `Turi ${t}`,
                      },
                      {
                        title: "Model",
                        dataIndex: "model",
                        render: (v: string | null) => v ?? "—",
                      },
                      {
                        title: "SN",
                        dataIndex: "sn",
                        render: (v: string | null) => v ?? "—",
                      },
                      {
                        title: "Dastur versiyasi",
                        dataIndex: "softwareVersion",
                        render: (v: string | null) => v ?? "—",
                      },
                    ]}
                  />
                </div>
              ),
            }}
          />
        </Card>
      </Spin>
      <Text type="secondary" style={{ fontSize: 13 }}>
        Ma'lumot Huawei FusionSolar'dan har 10 daqiqada, alarmlar har 32
        daqiqada olinadi; stansiya va qurilmalar ro'yxati har 2 soatda
        yangilanadi. Alarm 30 daqiqadan ko'p davom etsa, Telegram'ga xabar
        ketadi. Ishlash foizi, harorat va daromad umumiy sahifalarda boshqa
        stansiyalar bilan birga ko'rinadi.
      </Text>
    </div>
  );
};

export default HuaweiStations;
