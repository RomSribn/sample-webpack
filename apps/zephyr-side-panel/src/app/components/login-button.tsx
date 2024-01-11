import { useState } from 'react';
import { loginWithLink } from '../auth/authorization';
import { getActiveTabUrl } from '../utils/get-active-tab-url';

export function LoginButton({ accessToken }: { accessToken?: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(!!accessToken);
  const buttonTitle = isLoading ? 'Loading...' : 'Login';

  const handleClick = async () => {
    setIsLoading(true);
    const url = await getActiveTabUrl();
    if (url) {
      await loginWithLink(url);
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
