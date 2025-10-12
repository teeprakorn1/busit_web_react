// hooks/useSelection.js
import { useState, useCallback, useMemo } from 'react';

export const useSelection = (participants) => {
  const [selectedParticipants, setSelectedParticipants] = useState(new Set());

  const selectAll = useCallback(() => {
    const allIds = new Set(participants.map(p => p.Users_ID));
    setSelectedParticipants(allIds);
  }, [participants]);

  const deselectAll = useCallback(() => {
    setSelectedParticipants(new Set());
  }, []);

  const toggleSelection = useCallback((userId) => {
    setSelectedParticipants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const isSelected = useCallback((userId) => {
    return selectedParticipants.has(userId);
  }, [selectedParticipants]);

  const isAllSelected = useMemo(() => {
    if (participants.length === 0) return false;
    return participants.every(p => selectedParticipants.has(p.Users_ID));
  }, [participants, selectedParticipants]);

  const selectedCount = selectedParticipants.size;

  const getSelectedParticipantsData = useCallback(() => {
    return participants.filter(p => selectedParticipants.has(p.Users_ID));
  }, [participants, selectedParticipants]);

  return {
    selectedParticipants,
    selectAll,
    deselectAll,
    toggleSelection,
    isSelected,
    isAllSelected,
    selectedCount,
    getSelectedParticipantsData
  };
};