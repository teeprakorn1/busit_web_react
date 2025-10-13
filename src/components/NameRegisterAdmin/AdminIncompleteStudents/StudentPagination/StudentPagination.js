import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './StudentPagination.module.css';

function StudentPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}) {
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.paginationInfo}>
        <span className={styles.itemsInfo}>
          แสดง {startItem}-{endItem} จาก {totalItems} รายการ
        </span>
      </div>

      <div className={styles.paginationControls}>
        <button
          className={`${styles.navButton} ${currentPage === 1 ? styles.disabled : ''}`}
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          title="หน้าแรก"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          className={`${styles.navButton} ${currentPage === 1 ? styles.disabled : ''}`}
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          title="ก่อนหน้า"
        >
          <ChevronLeft size={18} />
        </button>

        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                ...
              </span>
            ) : (
              <button
                key={page}
                className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          className={`${styles.navButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          title="ถัดไป"
        >
          <ChevronRight size={18} />
        </button>

        <button
          className={`${styles.navButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          title="หน้าสุดท้าย"
        >
          <ChevronsRight size={18} />
        </button>
      </div>

      <div className={styles.pageJump}>
        <span className={styles.jumpLabel}>ไปที่หน้า:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages) {
              onPageChange(page);
            }
          }}
          className={styles.jumpInput}
        />
        <span className={styles.totalPages}>/ {totalPages}</span>
      </div>
    </div>
  );
}

export default StudentPagination;