import React, { type ReactNode } from 'react';
import './AdjustableCard.css';

interface AdjustableCardProps {
  children: ReactNode;
  title?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  className?: string;
}

const AdjustableCard: React.FC<AdjustableCardProps> = ({
  children,
  title,
  width = '400px',
  height = 'auto',
  minWidth = '200px',
  minHeight = '150px',
  maxWidth = '800px',
  maxHeight = '600px',
  className = '',
}) => {
  return (
    <div
      className={`adjustable-card ${className}`}
      style={{
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
      }}
    >
      {title && <div className="adjustable-card-header">{title}</div>}
      <div className="adjustable-card-content">{children}</div>
    </div>
  );
};

export default AdjustableCard;
