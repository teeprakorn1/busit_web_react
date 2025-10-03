// ActivityPagination/ActivityPagination.jsx
import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ActivityPagination.module.css';

function ActivityPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  showInfo = true
}) {
  const getVisiblePages = useMemo(() => {
    if (totalPages <= 1) return [];
    
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  const { startItem, endItem } = useMemo(() => ({
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems)
  }), [currentPage, itemsPerPage, totalItems]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePageClick = useCallback((page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  return (
    <div className={styles.paginationContainer}>
      {showInfo && (
        <div className={styles.pageInfo}>
          แสดง {startItem.toLocaleString()}-{endItem.toLocaleString()} จาก {totalItems.toLocaleString()} กิจกรรม
        </div>
      )}
      
      <div className={styles.pagination}>
        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          disabled={currentPage === 1}
          onClick={handlePreviousPage}
        >
          <ChevronLeft className={styles.icon} />
          <span className={styles.navText}>Previous</span>
        </button>

        {getVisiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className={styles.dots}>
                ...
              </span>
            );
          }

          const isCurrentPage = currentPage === page;
          return (
            <button
              key={page}
              className={`${styles.pageButton} ${
                isCurrentPage ? styles.activePage : ''
              }`}
              onClick={() => handlePageClick(page)}
              disabled={isCurrentPage}
            >
              {page}
            </button>
          );
        })}

        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          disabled={currentPage === totalPages}
          onClick={handleNextPage}
        >
          <span className={styles.navText}>Next</span>
          <ChevronRight className={styles.icon} />
        </button>
      </div>
      
      <div className={styles.mobileInfo}>
        หน้า {currentPage} จาก {totalPages}
      </div>
    </div>
  );
}

export default React.memo(ActivityPagination);