import React from 'react';
import clsx from 'clsx';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'btn-icon-sm' : size === 'lg' ? 'btn-icon-lg' : '';

  return (
    <button
      className={clsx('btn-icon', sizeClass, className)}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
};
