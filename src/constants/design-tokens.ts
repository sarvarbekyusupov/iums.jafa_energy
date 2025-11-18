/**
 * Design tokens following SolisCloud design system
 * Use these constants for consistent styling across HopeCloud pages
 */

export const DESIGN_TOKENS = {
  // Gradient backgrounds for cards and headers
  gradients: {
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    teal: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    pastel: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    orange: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    green: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },

  // Tinted backgrounds for sections
  backgrounds: {
    green: '#f6ffed',
    greenBorder: '#b7eb8f',
    blue: '#e6f7ff',
    blueBorder: '#91d5ff',
    orange: '#fff7e6',
    orangeBorder: '#ffd591',
    purple: '#f9f0ff',
    purpleBorder: '#d3adf7',
    red: '#fff1f0',
    redBorder: '#ffccc7',
  },

  // Status colors
  status: {
    online: '#52c41a',
    offline: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff',
    purple: '#722ed1',
    success: '#52c41a',
    error: '#ff4d4f',
    processing: '#1890ff',
  },

  // Icon colors matching status
  icons: {
    power: '#faad14',
    energy: '#52c41a',
    station: '#1890ff',
    device: '#722ed1',
    alarm: '#ff4d4f',
    user: '#13c2c2',
  },

  // Menu colors
  menu: {
    primary: '#A1BC98',
    hover: '#8FAA7F',
    selected: '#7A9968',
  },

  // Border styles
  borders: {
    success: '4px solid #52c41a',
    error: '4px solid #ff4d4f',
    warning: '4px solid #faad14',
    info: '4px solid #1890ff',
  },
} as const;

export type GradientKey = keyof typeof DESIGN_TOKENS.gradients;
export type BackgroundKey = keyof typeof DESIGN_TOKENS.backgrounds;
export type StatusKey = keyof typeof DESIGN_TOKENS.status;
