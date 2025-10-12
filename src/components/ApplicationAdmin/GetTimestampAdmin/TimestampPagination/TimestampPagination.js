import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './TimestampPagination.module.css';

function TimestampPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  showInfo = true
}) {
  const getVisiblePages = () => {
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
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.paginationContainer}>
      {showInfo && (
        <div className={styles.pageInfo}>
          แสดง {startItem}-{endItem} จาก {totalItems} รายการ
        </div>
      )}

      <div className={styles.pagination}>
        {/* ปุ่มย้อนกลับ */}
        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="หน้าก่อนหน้า"
        >
          <ChevronLeft className={styles.icon} />
          <span className={styles.navText}>Previous</span>
        </button>

        {/* หมายเลขหน้า */}
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className={styles.dots}>
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''
                }`}
              onClick={() => onPageChange(page)}
              title={`หน้า ${page}`}
            >
              {page}
            </button>
          );
        })}

        {/* ปุ่มไปหน้าถัดไป */}
        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="หน้าถัดไป"
        >
          <span className={styles.navText}>Next</span>
          <ChevronRight className={styles.icon} />
        </button>
      </div>

      {/* ข้อมูลเพิ่มเติมสำหรับ mobile */}
      <div className={styles.mobileInfo}>
        หน้า {currentPage} จาก {totalPages}
      </div>
    </div>
  );
}

export default TimestampPagination;