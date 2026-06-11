/**
 * ManageMyVault Design System Theme Tokens
 * These are the programmatic equivalents of the Tailwind config values.
 */

export const theme = {
  colors: {
    vault: {
      base: '#0A0E1A',
      surface: '#0F1629',
      card: '#141B35',
      elevated: '#1A2240',
    },
    border: {
      subtle: '#1E2D4A',
      default: '#2A3F6B',
      accent: '#3B5998',
    },
    brand: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#22D3EE',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
    },
    text: {
      primary: '#F0F4FF',
      secondary: '#94A3B8',
      muted: '#475569',
      disabled: '#2D3748',
    },
  },
  // Industry color coding for organization cards
  industryColors: {
    technology: '#3B82F6',
    healthcare: '#10B981',
    finance: '#F59E0B',
    education: '#8B5CF6',
    manufacturing: '#EF4444',
    retail: '#EC4899',
    legal: '#6366F1',
    government: '#14B8A6',
    nonprofit: '#F97316',
    other: '#94A3B8',
  } as Record<string, string>,
} as const;

/**
 * Get the color for a health score value
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return theme.colors.status.success;
  if (score >= 50) return theme.colors.status.warning;
  return theme.colors.status.danger;
}

/**
 * Get the Tailwind class for a health score
 */
export function getHealthScoreClass(score: number): string {
  if (score >= 80) return 'text-status-success';
  if (score >= 50) return 'text-status-warning';
  return 'text-status-danger';
}

/**
 * Get color for an industry type
 */
export function getIndustryColor(industry: string): string {
  const key = industry.toLowerCase().replace(/\s+/g, '');
  return theme.industryColors[key] || theme.industryColors.other;
}
