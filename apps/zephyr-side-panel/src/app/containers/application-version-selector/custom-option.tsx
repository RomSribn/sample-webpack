import {
  Box,
  AutocompleteOwnerState,
  AutocompleteRenderOptionState,
} from '@mui/material';

import { ApplicationVersion } from '../../hooks/queries/application-version';

type renderOptionProps = [
  props: React.HTMLAttributes<HTMLLIElement>,
  option: ApplicationVersion,
  state: AutocompleteRenderOptionState,
  ownerState: AutocompleteOwnerState<
    ApplicationVersion,
    false,
    true,
    false,
    'div'
  >,
];

interface CustomOptionProps {
  /**
   * MUI Autocomplete renderOption props.
   */
  renderOptionProps: renderOptionProps;
  /**
   * The function to call when the option is clicked.
   */
  handleChange: (option: ApplicationVersion) => void;
  /**
   * The ref of the option element.
   * This is set to null if the option is not the last element.
   */
  optionRef: (node: Element) => void;
  /**
   * Whether the option is the last element in the list.
   * This is also used to show a loading indicator.
   */
  isLastElement: boolean;
}

/**
 * Custom Option component for the MUI Autocomplete.
 */
const CustomOption: React.FC<CustomOptionProps> = ({
  renderOptionProps: [props, option, , ownerState],
  handleChange,
  optionRef,
  isLastElement,
}) => (
  <>
    <Box
      {...props}
      onClick={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        props.onClick?.(e);
        handleChange(option);
      }}
      component="li"
      contentEditable={true}
      ref={isLastElement ? optionRef : null}
    >
      {ownerState.getOptionLabel(option)}
    </Box>
    {isLastElement && 'Loading...'}
  </>
);

export { CustomOption };
