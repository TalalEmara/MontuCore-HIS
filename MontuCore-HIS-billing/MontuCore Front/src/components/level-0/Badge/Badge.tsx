// Badge.tsx
import styles from './badge.module.css';

export enum Status {
  Fit = 'fit',
  Injured = 'injured',
  Pending = 'pending',
}

type BadgeProps = {
  label: string;
  /** one of: 'success' | 'warning' | 'pending' */
  variant?: 'success' | 'warning' | 'pending';
};

function Badge({ label, variant = 'pending' }: BadgeProps) {
  return (
    <div className={`${styles.badge} ${styles[variant]}`}>
      {label}
    </div>
  );
}

// Helper to map Status enum to CSS variant
type StatusBadgeProps = {
  status: Status;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<Status, BadgeProps['variant']> = {
    [Status.Fit]: 'success',
    [Status.Injured]: 'warning',
    [Status.Pending]: 'pending',
  };

  return <Badge label={status} variant={map[status]} />;
}

export default Badge;
