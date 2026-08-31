import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="state-container">
      <div className="state-icon">{icon || <Inbox size={26} />}</div>
      <div>
        <h4 className="heading-3" style={{ marginBottom: 4 }}>
          {title}
        </h4>
        {description && <p className="text-secondary text-sm">{description}</p>}
      </div>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
