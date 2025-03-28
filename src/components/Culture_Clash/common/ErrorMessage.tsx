import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center h-[600px]">
      <div className="text-red-500 text-center">
        <p className="text-xl font-bold mb-2">Oops!</p>
        <p>{message}</p>
      </div>
    </div>
  );
}