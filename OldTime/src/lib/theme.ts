import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 馆藏质感色彩系统
export const colors = {
  // 主色
  primary: '#8B4513',
  primaryLight: '#A0522D',
  primaryDark: '#6C2F00',
  
  // 金色
  gold: '#D4AF37',
  goldLight: '#E8C547',
  
  // 背景层次 - 古董白系统
  bgPage: '#F8F5EE',
  bgCard: '#FFFFFF',
  bgOverlay: 'rgba(0,0,0,0.5)',
  bgElevated: '#FAFAF8',
  bgParchment: '#F5F0E6',
  
  // 文字
  textPrimary: '#2D2318',
  textSecondary: '#5A4D3F',
  textTertiary: '#A89887',
  textInverse: '#FFFFFF',
  
  // 边框
  border: '#E5DCD1',
  borderLight: '#F0EDE8',
  borderGold: 'rgba(212,175,55,0.3)',
  
  // 语义色
  success: '#52C41A',
  successBg: '#F6FFED',
  warning: '#FAAD14',
  warningBg: '#FFFBE6',
  error: '#FF4D4F',
  errorBg: '#FFF2F0',
  info: '#1890FF',
  infoBg: '#E6F7FF',
} as const;

// 间距系统 - 基准4px
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// 圆角系统
export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// 字体层级 - 思源宋体
export const typography = {
  h1: { fontSize: 20, fontWeight: '600' as const, color: colors.textPrimary, lineHeight: 28, fontFamily: 'serif' },
  h2: { fontSize: 16, fontWeight: '500' as const, color: colors.textPrimary, lineHeight: 24, fontFamily: 'serif' },
  h3: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary, lineHeight: 22, fontFamily: 'serif' },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary, lineHeight: 22, fontFamily: 'serif' },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary, lineHeight: 18, fontFamily: 'serif' },
  small: { fontSize: 12, fontWeight: '400' as const, color: colors.textTertiary, lineHeight: 16, fontFamily: 'serif' },
  button: { fontSize: 16, fontWeight: '600' as const, color: colors.textInverse, fontFamily: 'serif' },
} as const;

// 阴影系统 - 画框效果
export const shadows = {
  sm: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  md: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#2D2318',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#2D2318',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  frame: {
    borderWidth: 2,
    borderColor: colors.borderGold,
    shadowColor: '#2D2318',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

// 动画时长
export const animation = {
  fast: 100,
  normal: 150,
  slow: 200,
} as const;

// 屏幕尺寸
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  maxWidth: 480,
} as const;

// 常量
export const MAX_PHOTOS = 200;
export const MAX_VIDEOS = 10;
export const MAX_STORY_LENGTH = 500;
export const MAX_TITLE_LENGTH = 50;
export const SPLASH_DURATION = 2000;
export const TOAST_DURATION = 2500;
export const GENERATING_PHASE_DURATION = 800;
