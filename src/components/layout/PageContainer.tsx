import clsx from 'clsx';
import React from 'react';

const PageContainer: React.FC<{ className?: string }> = ({
  children,
  className
}) => (
  <div
    className={clsx(
      'container mx-auto mt-20 px-4 py-4',
      'sm:mt-24 sm:px-6 sm:py-6',
      'md:mt-28 md:px-8 md:py-8',
      'lg:mt-32 lg:px-12',
      'xl:px-16',
      className
    )}
  >
    {children}
  </div>
);

export default PageContainer;
