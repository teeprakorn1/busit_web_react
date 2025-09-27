import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DataEditPagination.module.css';

function DataEditPagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
  showInfo = true
}) {
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const validTotalPages = Math.max(1, totalPages);

  const getVisiblePages = () => {
    if (validTotalPages <= 1) return [1];

    const delta = 2;
    const rangeWithDots = [];

    if (validTotalPages <= 7) {
      for (let i = 1; i <= validTotalPages; i++) {
        rangeWithDots.push(i);
      }
      return rangeWithDots;
    }

    rangeWithDots.push(1);
    const rangeStart = Math.max(2, validCurrentPage - delta);
    const rangeEnd = Math.min(validTotalPages - 1, validCurrentPage + delta);

    if (rangeStart > 2) {
      rangeWithDots.push('...');
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== validTotalPages) {
        rangeWithDots.push(i);
      }
    }

    if (rangeEnd < validTotalPages - 1) {
      rangeWithDots.push('...');
    }

    if (validTotalPages > 1) {
      rangeWithDots.push(validTotalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (typeof onPageChange !== 'function') return;

    if (page >= 1 && page <= validTotalPages && page !== validCurrentPage) {
      onPageChange(page);
    }
  };

  const startItem = Math.max(1, (validCurrentPage - 1) * itemsPerPage + 1);
  const endItem = Math.min(validCurrentPage * itemsPerPage, totalItems);

  if (validTotalPages <= 1 || totalItems === 0) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className={styles.paginationContainer}>
      {showInfo && totalItems > 0 && (
        <div className={styles.pageInfo}>
          แสดง {startItem.toLocaleString()}-{endItem.toLocaleString()} จาก {totalItems.toLocaleString()} รายการการแก้ไข
        </div>
      )}

      <div className={styles.pagination}>
        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          disabled={validCurrentPage === 1}
          onClick={() => handlePageChange(validCurrentPage - 1)}
          title="หน้าก่อนหน้า"
          type="button"
        >
          <ChevronLeft className={styles.icon} />
          <span className={styles.navText}>ก่อนหน้า</span>
        </button>

        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className={styles.dots}>
                ...
              </span>
            );
          }

          const pageNumber = Number(page);
          const isActive = validCurrentPage === pageNumber;

          return (
            <button
              key={`page-${pageNumber}`}
              className={`${styles.pageButton} ${isActive ? styles.activePage : ''}`}
              onClick={() => handlePageChange(pageNumber)}
              title={`หน้า ${pageNumber}`}
              type="button"
              disabled={isActive}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          disabled={validCurrentPage === validTotalPages}
          onClick={() => handlePageChange(validCurrentPage + 1)}
          title="หน้าถัดไป"
          type="button"
        >
          <span className={styles.navText}>ถัดไป</span>
          <ChevronRight className={styles.icon} />
        </button>
      </div>

      <div className={styles.mobileInfo}>
        หน้า {validCurrentPage} จาก {validTotalPages}
      </div>
    </div>
  );
}

export default DataEditPagination;