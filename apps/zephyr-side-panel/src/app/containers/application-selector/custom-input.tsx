import { TextField, AutocompleteRenderInputParams } from '@mui/material';

type CustomInputProps = AutocompleteRenderInputParams;

/**
 * Custom Input component for the MUI Autocomplete.
 */
const CustomInput: React.FC<CustomInputProps> = ({
  id,
  inputProps,
  InputProps,
}) => <TextField id={id} inputProps={inputProps} InputProps={InputProps} />;

export { CustomInput };
