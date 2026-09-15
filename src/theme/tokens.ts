import type { ThemeConfig } from 'antd';

/**
 * One place where the brand colours live.
 *
 * The app had no theme at all, so Ant Design kept its default blue while the pages were
 * painted green by hand, and the two fought on every screen. Green is the brand, but it
 * belongs on the things that carry the brand: the sider, the primary action, a link. Not
 * the page background, not every heading, not every number.
 */

/** Deep enough to read as a brand colour rather than a highlighter. */
export const BRAND_GREEN = '#047857';
export const BRAND_GREEN_DARK = '#064E3B';
export const BRAND_GREEN_HOVER = '#059669';

/** Neutral page ground with only a whisper of green, so it sits under the sider quietly. */
export const PAGE_BG = '#F4F6F5';
export const SURFACE = '#FFFFFF';

/** Kept as Ant Design's own semantics: these say good, careful, wrong, not "brand". */
export const STATUS_SUCCESS = '#52C41A';
export const STATUS_WARNING = '#FAAD14';
export const STATUS_ERROR = '#FF4D4F';
export const STATUS_INFO = '#1890FF';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: BRAND_GREEN,
    colorLink: BRAND_GREEN,
    colorSuccess: STATUS_SUCCESS,
    colorWarning: STATUS_WARNING,
    colorError: STATUS_ERROR,
    colorInfo: STATUS_INFO,
    colorBgLayout: PAGE_BG,
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Layout: {
      bodyBg: PAGE_BG,
      headerBg: SURFACE,
      siderBg: BRAND_GREEN_DARK,
    },
    Menu: {
      // The sider is the one place the brand colour covers a whole surface.
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: BRAND_GREEN,
      darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      darkItemColor: 'rgba(236, 253, 245, 0.85)',
      darkItemSelectedColor: '#FFFFFF',
    },
    Card: {
      borderRadiusLG: 10,
    },
    Button: {
      primaryShadow: 'none',
    },
  },
};

export default theme;
