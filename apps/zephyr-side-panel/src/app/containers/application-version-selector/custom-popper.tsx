import { Popper, PopperProps } from '@mui/material';

type CustomPopperProps = PopperProps;

/**
 * Custom Popper component for the MUI Autocomplete.
 * @param props  mui PopperProps.
 */
const CustomPopper: React.FC<CustomPopperProps> = (
  props: CustomPopperProps,
) => <Popper {...props} className="custom-select__popper" />;

export { CustomPopper };
