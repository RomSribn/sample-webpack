// @mui
import { Box, TextField, AutocompleteRenderInputParams } from '@mui/material';
// components
import { StatusBadge } from '../../../components/status-badge';
// icons
import { NewTabIcon } from '../../../../assets/icons';

interface InputProps extends AutocompleteRenderInputParams {
  /**
   * the flag status of the deployment.
   */
  isDeployed: boolean;
}
/**
 * The custom input of the application remote select. Includes start and end adornment icons with deploy status.
 */
const Input = ({ id, inputProps, InputProps, isDeployed }: InputProps) => (
  <TextField
    id={id}
    inputProps={inputProps}
    InputProps={{
      ...InputProps,
      startAdornment: (
        <Box sx={{ display: 'flex', padding: '0 12px' }}>
          <NewTabIcon />
        </Box>
      ),
      endAdornment: (
        <Box>
          <StatusBadge
            type={isDeployed ? 'success' : 'warning'}
            title={isDeployed ? 'Deployed' : 'Not Deployed'}
          />
          {InputProps?.endAdornment}
        </Box>
      ),
    }}
  />
);

export { Input };
