import { useContext } from 'react';
import cx from 'classnames';

import { DataContext } from '../context/data-context';

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
}: Readonly<PublishButtonProps>) {
  const { setData, ...data } = useContext(DataContext);

  const handleClick = () => {
    console.log('Publishing updates', data);
  };

  return (
    <button
      className={cx('publish-button', 'button', className)}
      disabled={disabled}
      onClick={handleClick}
    >
      Publish updates
    </button>
  );
}

export default PublishButton;
