/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentProps,
  ComponentType,
  JSXElementConstructor,
  PropsWithChildren,
} from 'react';

export const provider = <C extends JSXElementConstructor<any>>(
  provider: C,
  props: Partial<ComponentProps<C>> = {},
): [C, Partial<ComponentProps<C>>] => [provider, props];

interface ProviderComposerProps {
  providers: [
    JSXElementConstructor<PropsWithChildren<any>> | ComponentType<any>,
    Record<string, any>,
  ][];
  children: JSX.Element | JSX.Element[];
}

export const ProviderComposer = ({
  providers,
  children,
}: ProviderComposerProps) => {
  for (let i = providers.length - 1; i >= 0; --i) {
    const [Provider, props] = providers[i];
    children = <Provider {...props}>{children}</Provider>;
  }
  return children;
};
