import classnames from 'classnames';
// icons
import { WarningIcon } from '../../assets/icons/warning-icon';

const badgeIcon = {
  success: (
    <img
      src={'../assets/icons/green-check.png'}
      alt="success-status-icon"
      className="badge-box__badge-icon"
    />
  ),
  warning: <WarningIcon className="badge-box__badge-icon" />,
  disabled: '',
  error: '',
};

interface StatusBadgeProps {
  className?: string;
  /**
   * badge variant (simple text or contained)
   */
  variant?: 'text' | 'contained';
  /**
   * type of the badge (deployed status)
   */
  type: 'success' | 'warning' | 'disabled' | 'error';
  /**
   * title of the badge
   */
  title?: string;
}

export function StatusBadge({
  type,
  variant = 'text',
  title,
}: StatusBadgeProps) {
  return (
    <div id="badge-box" className={classnames('badge-box', variant)}>
      <div className={classnames('status-badge', type)}>
        {variant === 'contained' && badgeIcon[type]}
        {title}
      </div>
    </div>
  );
}

export default StatusBadge;
