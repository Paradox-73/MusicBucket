import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="bg-red-50 text-red-600 p-4 rounded-lg">
    <p>{message}</p>
  </div>
);