import { useState, useContext } from 'react';
// context
import { AppContext } from '../context/app-context';
// utils
import { loginWithLink } from '../auth/authorization';
import { getActiveTabUrl } from '../utils/get-active-tab-url';

interface LoginButtonProps {
  accessToken?: string;
}

export function LoginButton({ accessToken }: LoginButtonProps) {
  const { refreshToken } = useContext(AppContext);

  const [isLoading, setIsLoading] = useState<boolean>(!!accessToken);
  const buttonTitle = isLoading ? 'Loading...' : 'Login';

  const handleClick = async () => {
    setIsLoading(true);
    const url = await getActiveTabUrl();
    if (url) {
      await loginWithLink(url);
      refreshToken();
    }
  };

  return (
    <div className="authorization-box">
      <button
        className="activeButton"
        onClick={handleClick}
        disabled={isLoading}
      >
        {buttonTitle}
      </button>
    </div>
  );
}
