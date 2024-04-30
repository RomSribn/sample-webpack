import { ChangeEvent, useEffect, useState, useCallback } from 'react';
import classnames from 'classnames';

// components
import Checkbox from './checkbox';
// utils
import { getActiveTabUrl, navigate, livereloadSocket } from '../utils';

const DEFAULT_LABEL = 'Live reload / HMR';

interface LivereloadCheckboxProps {
  className?: string;
  /**
   * label of the checkbox
   */
  label?: string;
  /**
   * value of the livereload room to join (application_uid)
   */
  value: string;
}

export function LivereloadCheckbox({
  className,
  label = DEFAULT_LABEL,
  value,
}: LivereloadCheckboxProps) {
  const [checked, setChecked] = useState<boolean>();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const handleCheckedChange = useCallback(async () => {
    const activeTabUrl = await getActiveTabUrl({ fullUrl: true });

    if (!activeTabUrl) return;

    const currentUrl = new URL(activeTabUrl);
    const isRemoteExist = await chrome.cookies.get({ url: activeTabUrl, name: value });

    if (checked === undefined && isRemoteExist) {
      setChecked(true);
      return;
    }

    if (checked && !isRemoteExist) {
      await chrome.cookies.set({ url: activeTabUrl, name: value, value });
      livereloadSocket.join(value);
    }

    if (!checked && isRemoteExist) {
      await chrome.cookies.remove({ url: activeTabUrl, name: value });
      livereloadSocket.leave(value);
    }

    await navigate(currentUrl.toString());
  }, [checked, value]);

  useEffect(() => {
    handleCheckedChange();
  }, [handleCheckedChange]);

  return (
    <Checkbox
      label={label}
      className={classnames('livereload-checkbox', className)}
      checked={checked}
      onChange={handleChange}
    />
  );
}

export default LivereloadCheckbox;
