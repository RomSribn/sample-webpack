import {
  Box,
  AutocompleteOwnerState,
  AutocompleteRenderOptionState,
} from '@mui/material';

import { Application } from '../../hooks/queries/application';

type renderOptionProps = [
  props: React.HTMLAttributes<HTMLLIElement>,
  option: Application,
  state: AutocompleteRenderOptionState,
  ownerState: AutocompleteOwnerState<Application, false, true, false, 'div'>,
];

interface CustomOptionProps {
  /**
   * MUI Autocomplete renderOption props.
   */
  renderOptionProps: renderOptionProps;
  /**
   * The function to call when the option is clicked.
   */
  handleChange: (option: Application) => void;
}

/**
 * Custom Option component for the MUI Autocomplete.
 */
const CustomOption: React.FC<CustomOptionProps> = ({
  renderOptionProps: [props, option, state, ownerState],
  handleChange,
}) => (
  <Box
    {...props}
    onClick={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      props.onClick?.(e);
      handleChange(option);
    }}
    component="li"
    contentEditable={true}
  >
    {ownerState.getOptionLabel(option)}
  </Box>
);

export { CustomOption };
