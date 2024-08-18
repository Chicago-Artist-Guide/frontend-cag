import clsx from 'clsx';
import React from 'react';

const PageContainer: React.FC<{ className?: string }> = ({
  children,
  className
}) => (
  <div className={clsx('container mx-auto mt-32 px-4 py-8', className)}>
    {children}
  </div>
);

export default PageContainer;
