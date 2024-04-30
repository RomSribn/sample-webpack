import classnames from 'classnames';
// icons
import { WarningIcon, CheckMarkIcon } from '../../assets/icons';

const badgeIcon = {
  success: <CheckMarkIcon className="badge-box__badge-icon" color='#54c752' width={20}/>,
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
