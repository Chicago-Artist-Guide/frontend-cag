import clsx from 'clsx';
import React from 'react';

const PageContainer: React.FC<{ className?: string }> = ({
  children,
  className
}) => (
  <div
    className={clsx(
      'container mx-auto px-4 py-8',
      'mt-20 sm:mt-24 md:mt-28 lg:mt-32',
      className
    )}
  >
    {children}
  </div>
);

export default PageContainer;
