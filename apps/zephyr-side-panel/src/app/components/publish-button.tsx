import React from 'react';
import cx from 'classnames';

interface PublishButtonProps {
  /**
   * additional class name for the button
   */
  className?: string;
  /**
   * whether the button is disabled or not
   */
  disabled?: boolean;
}

export function PublishButton({
  className,
  disabled = true,
}: PublishButtonProps) {
  return (
    <button
      className={cx('publish-button', 'button', className)}
      disabled={disabled}
    >
      Publish updates
    </button>
  );
}

export default PublishButton;
