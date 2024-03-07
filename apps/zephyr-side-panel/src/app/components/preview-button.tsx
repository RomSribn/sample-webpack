import React from 'react';
import cx from 'classnames';

interface PreviewButtonProps {
  /**
   * additional class name for the button
   */
  className?: string;
}

export function PreviewButton({ className }: PreviewButtonProps) {
  return (
    <button disabled className={cx('preview-button', 'button', className)}>
      Preview Build
    </button>
  );
}

export default PreviewButton;
