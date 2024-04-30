import { ChangeEvent } from 'react';
import classnames from 'classnames';

// components
import { CheckMarkIcon } from '../../assets/icons';

interface CheckboxProps {
  checked?: boolean;
  label?: string;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({ label, checked, onChange, className }: CheckboxProps) => (
  <label className={classnames('custom-checkbox', className)}>
    {label}
    <input
      className='input'
      type="checkbox"
      checked={checked}
      onChange={onChange}
    />
    <span className="checkmark">
      <CheckMarkIcon className='checkmark-icon'/>
    </span>
  </label>
);

export default Checkbox;
