import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  highlighted?: boolean;
  compact?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  highlighted = false,
  compact = false,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'card',
        hoverable && 'card-hover',
        highlighted && 'card-highlight',
        compact && 'card-compact',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
