import React from 'react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="state-container">
      <div className="spinner" />
      <p className="text-secondary font-medium">{message}</p>
    </div>
  );
};
