import React from "react";
import { Tooltip } from "antd";
import type { PageHealth, PageStatus } from "./page-status";

const COLOR: Record<PageHealth, string> = { ok: "#52c41a", partial: "#faad14", broken: "#ff4d4f" };
const WORD: Record<PageHealth, string> = { ok: "Ishlayapti", partial: "Qisman ishlaydi", broken: "Ishlamayapti" };

export const PageStatusDot: React.FC<{ status: PageStatus }> = ({ status }) => (
  <Tooltip title={`${WORD[status.health]}: ${status.note}`} placement="right">
    <span
      aria-label={WORD[status.health]}
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: COLOR[status.health],
        marginLeft: 8,
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    />
  </Tooltip>
);

