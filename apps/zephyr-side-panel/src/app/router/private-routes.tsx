import { FC, ComponentType, useContext } from 'react';
// components
import { LoginButton } from '../components/login-button';
// context
import { AppContext } from '../context/app-context';

function withAuthenticationRequired<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
): FC<P> {
  return (props: P): JSX.Element => {
    const { token } = useContext(AppContext);

    if (!token) return <LoginButton />;

    return <Component {...props} />;
  };
}

interface RouteProps {
  component: ComponentType;
  [x: string]: unknown;
}

const ProtectedRoute = ({ component }: RouteProps) => {
  const Component = withAuthenticationRequired(component);
  return <Component />;
};

export { withAuthenticationRequired, ProtectedRoute }; // routes
