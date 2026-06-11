import { getIndustryColor } from '../../../config/theme';

interface IndustryBadgeProps {
  industry: string | null | undefined;
}

/**
 * Industry badge with color-coded indicator.
 */
export default function IndustryBadge({ industry }: IndustryBadgeProps) {
  if (!industry) return null;

  const color = getIndustryColor(industry);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-vault-elevated border border-border-subtle"
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {industry}
    </span>
  );
}
