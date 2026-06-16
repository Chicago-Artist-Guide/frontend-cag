declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<
    React.PropsWithChildren<React.SVGProps<SVGSVGElement>>
  >;
  const src: string;
  export default src;
}
