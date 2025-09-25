import { useCallback } from 'react';

const useDateFormatter = () => {
  const formatDateForInput = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  }, []);

  const formatDateForSubmit = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) return '';
      return date.toISOString();
    } catch (error) {
      console.error('Error formatting date for submit:', error);
      return '';
    }
  }, []);

  const formatDateForDisplay = useCallback((dateString, options = {}) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        locale: 'th-TH'
      };

      const formatOptions = { ...defaultOptions, ...options };

      if (formatOptions.locale === 'th-TH') {
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return '';
    }
  }, []);

  const formatDateTimeForDisplay = useCallback((dateString, options = {}) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        locale: 'th-TH'
      };

      const formatOptions = { ...defaultOptions, ...options };

      if (formatOptions.locale === 'th-TH') {
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting datetime for display:', error);
      return '';
    }
  }, []);

  const isValidDate = useCallback((dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch (error) {
      return false;
    }
  }, []);

  const calculateAge = useCallback((birthDate) => {
    if (!birthDate || !isValidDate(birthDate)) return null;

    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  }, [isValidDate]);

  return {
    formatDateForInput,
    formatDateForSubmit,
    formatDateForDisplay,
    formatDateTimeForDisplay,
    isValidDate,
    calculateAge
  };
};

export default useDateFormatter;