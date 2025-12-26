import React, { useEffect } from 'react';
import styles from './BasicOverlay.module.css';

interface BasicOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BasicOverlay({ isOpen, onClose, title, children }: BasicOverlayProps) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlayBackdrop} onClick={onClose}>
      <div className={styles.overlayContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Row */}
        <div className={styles.header}>
           {title && <h2 className={styles.title}>{title}</h2>}
           <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {/* Scrollable Content */}
        <div className={styles.body}>
           {children}
        </div>

      </div>
    </div>
  );
}