import { useState, useRef } from 'react';
// material
import { Box } from '@mui/material';
// components
import { StatusBadge } from '../../components/status-badge';
import { NavigationPopover } from './navigation-popover';
// icons
import { BurgerIcon } from '../../../assets/icons';

export const ID = 'navigation-popover' as const;

interface NavigationProps {
  /**
   * The title of the navigation.
   */
  title: string;
  /**
   * The status of the deployment (undefined for no app exists).
   */
  deployStatus?: 'success' | 'warning';
}
/**
 * Navigation with burger menu and page title.
 */
const Navigation = ({ title, deployStatus }: NavigationProps) => {
  const [open, setOpen] = useState(false);
  const anchorEl = useRef(null);

  return (
    <>
      <div className="header navigation" ref={anchorEl} aria-describedby={ID}>
        <Box display={'flex'} alignItems={'center'}>
          <Box className="burger-icon" onClick={() => setOpen(!open)}>
            <BurgerIcon color={open ? '#4172BD' : '#53576C'} />
          </Box>
          <h3>{title}</h3>
        </Box>
        {deployStatus && (
          <StatusBadge
            type={deployStatus}
            variant="contained"
            title={deployStatus === 'success' ? 'Deployed' : 'Not Deployed'}
          />
        )}
      </div>
      <NavigationPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
};

export { Navigation };
