import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected issue occurred while loading this section.',
  onRetry,
}) => {
  return (
    <div className="state-container">
      <div className="state-icon state-icon-red">
        <AlertTriangle size={26} />
      </div>
      <div>
        <h4 className="heading-3" style={{ marginBottom: 4 }}>
          {title}
        </h4>
        {message && <p className="text-secondary text-sm">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
