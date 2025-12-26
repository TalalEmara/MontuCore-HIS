import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: 'default' | 'white';
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange,variant = 'default' }) => {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className={styles.paginationContainer} data-variant={variant}>
      <button 
        className={styles.arrowButton} 
        onClick={handlePrevious} 
        disabled={currentPage === 1}
      >
        <span className={styles.arrowLeft}></span>
      </button>

      <div className={styles.pageIndicator}>
        <span className={styles.current}>{currentPage}</span>
        <span className={styles.separator}>/</span>
        <span className={styles.total}>{totalPages}</span>
      </div>

      <button 
        className={styles.arrowButton} 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
      >
        <span className={styles.arrowRight}></span>
      </button>
    </div>
  );
};

export default Pagination;