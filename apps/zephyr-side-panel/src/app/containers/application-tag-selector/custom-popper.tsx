import { Popper, PopperProps } from '@mui/material';

type CustomPopperProps = PopperProps;

/**
 * Custom Popper component for the MUI Autocomplete.
 */
const CustomPopper: React.FC<CustomPopperProps> = (props) => (
  <Popper
    {...props}
    className="custom-select__popper application-group-select"
    style={{
      ...props.style,
      height: '4px',
    }}
  />
);

export { CustomPopper };
