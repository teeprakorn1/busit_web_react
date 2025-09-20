import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './TeacherPagination.module.css';

function TeacherPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  showInfo = true
}) {
  // Memoize การคำนวณ visible pages เพื่อไม่ให้คำนวณใหม่ทุกครั้ง
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

  // Memoize การคำนวณ start และ end items
  const { startItem, endItem } = useMemo(() => ({
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems)
  }), [currentPage, itemsPerPage, totalItems]);

  // Memoize page change handlers เพื่อป้องกัน unnecessary re-renders
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

  // ถ้ามีแค่ 1 หน้าหรือไม่มีข้อมูล ไม่แสดง pagination
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  return (
    <div className={styles.paginationContainer}>
      {showInfo && (
        <div className={styles.pageInfo}>
          แสดง {startItem.toLocaleString()}-{endItem.toLocaleString()} จาก {totalItems.toLocaleString()} รายการ
        </div>
      )}
      
      <div className={styles.pagination}>
        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          disabled={currentPage === 1}
          onClick={handlePreviousPage}
          title="หน้าก่อนหน้า"
          aria-label="ไปหน้าก่อนหน้า"
        >
          <ChevronLeft className={styles.icon} />
          <span className={styles.navText}>Previous</span>
        </button>

        {getVisiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span 
                key={`dots-${index}`} 
                className={styles.dots}
                aria-hidden="true"
              >
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
              title={`หน้า ${page}`}
              aria-label={`ไปหน้า ${page}`}
              aria-current={isCurrentPage ? 'page' : undefined}
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
          title="หน้าถัดไป"
          aria-label="ไปหน้าถัดไป"
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

export default React.memo(TeacherPagination);