import React from "react";
import type { MenuProps } from "antd";
import { PageStatusDot } from "./PageStatusDot";

/**
 * Which admin pages work, as last checked against production. Shown only to the maintainer, as a
 * dot after each menu label, so he can see at a glance what still needs fixing; every other
 * account sees the plain menu. The map is part of the bundle, so it says nothing secret.
 */
export type PageHealth = "ok" | "partial" | "broken";

export interface PageStatus {
  health: PageHealth;
  /** Why, in a sentence: what fails or what is missing. */
  note: string;
}

/** User id of the maintainer (Abdulaziz, super_admin) on production. */
export const MAINTAINER_USER_ID = 14;

/** Checked on 2026-10-15. Keys are the menu keys, which are route paths. */
export const PAGE_STATUS: Record<string, PageStatus> = {
  "/admin": { health: "ok", note: "Umumiy raqamlar, daromad va prognoz to'g'ri chiqadi." },
  "/admin/availability": { health: "ok", note: "Ishlash foizi va uzilishlar, 10-sentabrdan beri." },
  "/admin/temperature": { health: "ok", note: "Uchala vendor haroratlari va ogohlantirish chegaralari." },
  "/admin/users": { health: "ok", note: "Foydalanuvchilar ro'yxati va tahrirlash." },
  "/admin/user-stations": {
    health: "partial",
    note: "Biriktirish ishlaydi, lekin FSolar ro'yxati doim bo'sh chiqadi (kod xatosi) va HopeCloud ro'yxati ~7 soniya yuklanadi.",
  },
  "/admin/huawei": { health: "ok", note: "Huawei stansiyalari, qurilmalari va faol alarmlari." },
  "/admin/hopecloud/real-time-data": {
    health: "partial",
    note: "Ma'lumot to'g'ri, lekin sahifa ~17 soniya yuklanadi (avval HopeCloud'ga sog'liq so'rovi ketadi); Users tabi ham ~16 soniya; Communication bo'sh.",
  },
  "/admin/hopecloud/sync-data": {
    health: "partial",
    note: "Stansiya va qurilmalar ko'rinadi. Alarms tabi doim bo'sh (so'rov manzili xato), Communication bo'sh, saytlar 'Site 1–4' deb chiqadi.",
  },
  "/admin/fsolar/realtime": { health: "ok", note: "Ofisdagi 2 ta qurilma, saqlangan ma'lumotdan." },
  "/admin/fsolar/devices": { health: "partial", note: "Ro'yxat chiqadi, lekin holat doim 'Unknown' va Online 0/2." },
  "/admin/fsolar/settings": {
    health: "broken",
    note: "Masofaviy boshqaruv ataylab o'chirilgan (DEVICE_CONTROL_ENABLED), sahifa bo'sh ochiladi.",
  },
  "/admin/fsolar/energy": { health: "ok", note: "Vendor'dan jonli, faqat ofis qurilmalari." },
  "/admin/fsolar/history": { health: "ok", note: "Saqlangan 5 daqiqalik tarix; jonli rejim ham bor." },
  "/admin/fsolar/templates": { health: "ok", note: "Vendor'dan jonli; shablon yo'q (0 ta)." },
  "/admin/fsolar/tasks": { health: "partial", note: "Ro'yxat ochiladi, lekin vazifani ishga tushirish ataylab o'chirilgan." },
  "/admin/fsolar/monitor": { health: "partial", note: "Faqat Economic Tasks sahifasidan vazifa tanlab ochilganda ishlaydi, o'zi bo'sh." },
  "/admin/fsolar/records": { health: "ok", note: "Vendor'dan jonli, 16 ta yozuv." },
  "/admin/fsolar/alarms": { health: "partial", note: "Jonli rejim ishlaydi; 'Stored' rejimda bo'sh, hodisalar bazaga saqlanmaydi." },
  "/admin/soliscloud/dashboard": { health: "ok", note: "Jami raqamlar va Sync Now ishlaydi." },
  "/admin/soliscloud/stations": { health: "ok", note: "Ro'yxat, tafsilot va grafiklar ishlaydi." },
  "/admin/soliscloud/inverters": { health: "ok", note: "Ro'yxat, tafsilot va grafiklar ishlaydi." },
  "/admin/soliscloud/alarms": { health: "ok", note: "Jonli va saqlangan alarmlar." },
  "/admin/soliscloud/collectors": { health: "ok", note: "Ro'yxat, signal va diagnostika ishlaydi." },
  "/admin/soliscloud/epm": { health: "partial", note: "Sahifa ishlaydi, lekin EPM hisoblagichi o'rnatilmagan, ro'yxat bo'sh." },
  "/admin/soliscloud/weather": { health: "partial", note: "Sahifa ishlaydi, lekin ob-havo stansiyasi o'rnatilmagan, ro'yxat bo'sh." },
  "/admin/soliscloud/api-test": { health: "broken", note: "Prod'da bu sahifa yo'q (faqat dasturchi rejimida), menyuda ortiqcha turibdi." },
};

/** The same menu with a status dot after every page that has a known status. */
export function withPageStatus(items: MenuProps["items"]): MenuProps["items"] {
  return (items ?? []).map((item) => {
    if (!item || !("key" in item)) return item;
    const node = item as { key?: React.Key; label?: React.ReactNode; children?: MenuProps["items"] };
    const status = typeof node.key === "string" ? PAGE_STATUS[node.key] : undefined;
    return {
      ...item,
      ...(status ? { label: <span>{node.label}<PageStatusDot status={status} /></span> } : {}),
      ...(node.children ? { children: withPageStatus(node.children) } : {}),
    } as (typeof items extends (infer T)[] | undefined ? T : never);
  });
}
