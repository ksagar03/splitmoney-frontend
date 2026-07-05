/**
 * Single source of truth for SplitMoney's visual identity.
 *
 * `palette` mirrors the semantic color tokens defined in `tailwind.config.js`.
 * Use NativeWind `className` (e.g. `bg-surface`, `text-ink-muted`) in JSX, and
 * use `palette` / the gradient tuples here for the props that only accept raw
 * color values — `LinearGradient` colors, Ionicons `color`, `placeholderTextColor`,
 * `ActivityIndicator` color, etc.
 */

import { Platform } from 'react-native';

export const palette = {
  background: '#080812',
  surface: '#0E0E1C',
  surfaceAlt: '#090915',
  surfaceFocus: '#0C0C1A',
  surfaceRaised: '#13132A',
  avatar: '#2A2A3C',

  brand: '#8B5CF6',
  brandBlue: '#3B82F6',

  ink: '#FFFFFF',
  inkMuted: '#9CA3AF',
  inkFaint: '#6B7280',
  inkPlaceholder: '#3D3D5C',

  success: '#10B981',
  danger: '#EF4444',
} as const;

/** Primary purple → blue gradient used on buttons, avatars and the logo. */
export const brandGradient = ['#8B5CF6', '#3B82F6'] as const;
/** Dimmed variant shown while a gradient button is in its loading state. */
export const brandGradientDim = ['#4C3ABA', '#2A4ABA'] as const;
/** Soft tinted gradient for summary / highlight cards. */
export const surfaceGradient = ['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.05)'] as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
