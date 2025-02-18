import React from 'react';

interface TestProps {
  text: string;
}

export const Test: React.FC<TestProps> = ({ text }) => {
  return (
    <div>
      <h1>{text}</h1>
    </div>
  );
};
