import { useContext } from 'react';
import classnames from 'classnames';
import { useNavigate, useLocation } from 'react-router-dom';
// material
import { Popover, Box } from '@mui/material';
// context
import { AppContext } from '../../context/app-context';
// icons
import {
  AbTestingIcon,
  AppIcon,
  BracketsCurlyIcon,
  DocumentIcon,
  LogoutIcon,
  NewTabIcon,
  StickerIcon,
} from '../../../assets/icons';
// constants, utils
import { ID } from './index';
import { logout } from '../../auth/authorization';
import { RouteNames, routeTitles } from '../../router/route-names';

interface NavigationPopoverProps {
  open: boolean;
  anchorEl: React.RefObject<HTMLElement>;
  onClose: () => void;
}

const NavigationPopover = ({
  open,
  anchorEl,
  onClose,
}: NavigationPopoverProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { refreshToken } = useContext(AppContext);

  const handleLogout = async () => {
    await logout();
    // TODO: remove this timeout when the logout is handled properly
    setTimeout(() => refreshToken(), 0);
  };

  return (
    <Popover
      id={ID}
      className="custom-select__popper"
      open={open}
      anchorEl={anchorEl.current}
      onClose={() => onClose()}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <ul className="navigation-list">
        <li
          className={classnames('navigation-list__item', {
            active: location.pathname === RouteNames.APPLICATION,
          })}
          onClick={() => navigate(RouteNames.APPLICATION)}
          onKeyDown={() => navigate(RouteNames.APPLICATION)}
          role="button"
        >
          <AppIcon />
          <span>{routeTitles[RouteNames.APPLICATION]}</span>
        </li>
        <li
          className={classnames('navigation-list__item', {
            active: location.pathname === RouteNames.ENVIRONMENT,
          })}
          onClick={() => navigate(RouteNames.ENVIRONMENT)}
          onKeyDown={() => navigate(RouteNames.ENVIRONMENT)}
          role="button"
        >
          <BracketsCurlyIcon />
          <span>{routeTitles[RouteNames.ENVIRONMENT]}</span>
        </li>
        <li
          className={classnames('navigation-list__item', {
            disabled: true,
            active: false,
          })}
        >
          <StickerIcon />
          <span>{routeTitles[RouteNames.WHITELABELING]}</span>
        </li>
        <li
          className={classnames('navigation-list__item', {
            disabled: true,
            active: false,
          })}
        >
          <AbTestingIcon />
          <span>{routeTitles[RouteNames.ABTESTING]}</span>
        </li>
        <li
          className={classnames('navigation-list__item', {
            disabled: true,
            active: false,
          })}
        >
          <Box display={'flex'} alignItems={'center'} marginRight={4}>
            <DocumentIcon />
            <span>{routeTitles[RouteNames.DOCUMENTATION]}</span>
          </Box>
          <NewTabIcon />
        </li>
        <li
          className="navigation-list__item error"
          onClick={handleLogout}
          onKeyDown={handleLogout}
          role="button"
        >
          <LogoutIcon />
          <span>Log Out</span>
        </li>
      </ul>
    </Popover>
  );
};

export { NavigationPopover };
