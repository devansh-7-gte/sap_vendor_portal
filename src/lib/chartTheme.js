/**
 * Shared chart color tokens (literal hex, since chart libraries generally
 * don't accept CSS custom properties for stroke/fill props). Mirrors the
 * SAC design tokens defined in src/app/globals.css.
 */
export const chartTheme = {
  primary: '#059669', // Electric green
  series: ['#059669', '#71717a', '#fafafa', '#d97706', '#e11d48', '#27272a'],
  grid: '#27272a',
  axis: '#71717a',
  tooltipBg: '#131315',
  tooltipBorder: '#3f3f46',
  positive: '#059669',
  negative: '#e11d48',
  warn: '#d97706',
};

export default chartTheme;
