/**
 * Fields the pages show although the vendor API does not supply them (or supplies them only
 * sometimes). They were taken off the pages on 2026-10-15 and put back the same day at the
 * maintainer's request, each marked with an icon only he sees, so he knows which values cannot
 * be filled from the API. The same list goes into the report for Jamol aka.
 */
export interface ApiGap {
  /** Where the field is, as the maintainer would look for it. */
  page: string;
  /** The label on the page. */
  field: string;
  /** Why it is empty or unreliable, in a sentence. */
  why: string;
}

export const API_GAPS = {
  solisInverterType: {
    page: 'SolisCloud → Inverter detail',
    field: 'Inverter Type',
    why: "SolisCloud API'da bunday maydon yo'q, doim \"-\" turadi.",
  },
  solisRemainingCapacity: {
    page: 'SolisCloud → Inverter detail',
    field: 'Remaining Capacity',
    why: "API batareyaning qolgan sig'imini (kWh) bermaydi, faqat foizini (SOC).",
  },
  solisModuleTemperature: {
    page: 'SolisCloud → Inverter detail',
    field: 'Module Temperature',
    why: "Panel harorati faqat ob-havo stansiyasi bo'lsa keladi; bizda yo'q.",
  },
  solisAmbientTemperature: {
    page: 'SolisCloud → Inverter detail',
    field: 'Ambient Temperature',
    why: "Havo harorati faqat ob-havo stansiyasi bo'lsa keladi; bizda yo'q.",
  },
  solisRevenue: {
    page: 'SolisCloud → Station detail',
    field: 'Revenue & Performance (Income)',
    why: "API daromadni portaldagi narx bo'yicha hisoblaydi; hamma stansiyada narx 0, shuning uchun 0. So'mdagi daromad dashboard'da.",
  },
  solisCollectorNetwork: {
    page: 'SolisCloud → Collector detail',
    field: 'IP Address, MAC Address, Port',
    why: "MAC va port API'da yo'q; IP faqat ba'zan (lanIp) keladi.",
  },
  solisCollectorVersions: {
    page: 'SolisCloud → Collector detail',
    field: 'Software / Hardware / Protocol Version, Last Upgrade, Upgrade Available',
    why: "API faqat bitta firmware versiyasini beradi; qolganlari yo'q.",
  },
  solisCollectorPlace: {
    page: 'SolisCloud → Collector detail',
    field: 'Installation Location, First Connection, Installation Date',
    why: "Collector uchun joy va birinchi ulanish vaqti API'da yo'q; sana o'rniga faqat zavoddan chiqqan sana bor.",
  },
  hopeCloudFirmware: {
    page: 'HopeCloud → Qurilma oynasi',
    field: 'Firmware Version',
    why: "HopeCloud bitta \"firmware\" bermaydi, faqat DC/AC dastur versiyalarini beradi.",
  },
  hopeCloudStationEfficiency: {
    page: 'HopeCloud → Stansiya oynasi, Real-time',
    field: 'Efficiency',
    why: "Stansiya uchun samaradorlik API'da yo'q (faqat invertorda bor).",
  },
  hopeCloudStationProfile: {
    page: 'HopeCloud → Stansiya oynasi',
    field: 'Owner, Company, City, Province, District, Plant/Network Type, Orientation, Dip Angle, kontaktlar, Payment Type, Network Time, Modules',
    why: "Bular bazada saqlanmaydi; faqat jonli rejimda, portalda to'ldirilgan bo'lsa keladi.",
  },
  hopeCloudStatsColumns: {
    page: 'HopeCloud → Statistika jadvallari',
    field: 'Peak Power, Average Power, Efficiency',
    why: "Statistika API'si faqat kWh va daromad (yuanda) beradi.",
  },
  hopeCloudEarnings: {
    page: 'HopeCloud → Statistics dashboard',
    field: 'Earnings',
    why: "HopeCloud daromadni yuanda, 1 kWh = 0.078 narxda beradi; bizning so'mdagi hisobimizga mos emas.",
  },
  hopeCloudSiteAddress: {
    page: 'HopeCloud → Sync data, Site Details',
    field: 'Province, City, Address',
    why: "Bazada alohida saqlanmaydi; to'liq manzil \"Location\" qatorida.",
  },
  fsolarDelete: {
    page: 'Fsolar → Devices',
    field: 'Delete',
    why: "Diqqat: qurilmani Felicity akkauntining o'zidan o'chiradi.",
  },
  solisParallelPower: {
    page: 'SolisCloud → Inverter detail',
    field: 'Current Power / AC Power',
    why: "Parallel guruhning asosiy invertorida bu butun guruh quvvati, faqat shu invertorniki emas.",
  },
  fsolarTemperature: {
    page: 'Fsolar → Realtime',
    field: 'System Temperature',
    why: "Ilgari batareya harorati invertor harorati deb ko'rsatilardi; endi ikkalasi alohida.",
  },
} satisfies Record<string, ApiGap>;

export type ApiGapKey = keyof typeof API_GAPS;
