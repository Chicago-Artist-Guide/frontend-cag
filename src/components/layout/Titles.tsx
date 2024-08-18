import React from 'react';

export const Title: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...rest
}) => {
  return (
    <h1 className="uppercase" {...rest}>
      {children}
    </h1>
  );
};

export const TitleTwo: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...rest
}) => {
  return (
    <h2
      className="font-lora text-2xl font-normal italic leading-7 tracking-wider text-cornflower"
      {...rest}
    >
      {children}
    </h2>
  );
};

export const Tagline: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...rest
}) => {
  return (
    <h2
      className="mb-10 font-lora text-2xl font-normal italic leading-7 tracking-wider text-cornflower"
      {...rest}
    >
      {children}
    </h2>
  );
};

export const TitleThree: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...rest
}) => {
  return (
    <h3 className="text-xl font-bold" {...rest}>
      {children}
    </h3>
  );
};
