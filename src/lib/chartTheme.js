/**
 * Shared chart color tokens (literal hex, since chart libraries generally
 * don't accept CSS custom properties for stroke/fill props). Mirrors the
 * SAC design tokens defined in src/app/globals.css.
 */
export const chartTheme = {
  primary: '#1C1917',
  series: ['#1C1917', '#78716C', '#A8A29E', '#16A34A', '#EF4444', '#F59E0B'],
  grid: '#D6D3D1',
  axis: '#A8A29E',
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#E7E5E4',
  positive: '#16A34A',
  negative: '#EF4444',
  warn: '#F59E0B',
};

export default chartTheme;
