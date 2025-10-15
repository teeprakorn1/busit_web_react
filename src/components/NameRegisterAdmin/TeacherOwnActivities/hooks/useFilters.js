import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useFilters = (fetchActivities, rowsPerPage = 10) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [participationFilter, setParticipationFilter] = useState("all");
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPageState] = useState(1);

    const navigate = useNavigate();
    const location = useLocation();

    const setCurrentPage = useCallback((page) => {
        setCurrentPageState(page);
    }, []);

    const matchesSearchQuery = useCallback((activity, query) => {
        if (!query) return true;

        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        const searchFields = [
            activity.title?.toLowerCase() || '',
            activity.description?.toLowerCase() || '',
            activity.locationDetail?.toLowerCase() || '',
            activity.typeName?.toLowerCase() || '',
            activity.statusName?.toLowerCase() || ''
        ];

        return searchTerms.every(term =>
            searchFields.some(field => field.includes(term))
        );
    }, []);

    const getFilteredAndSortedActivities = useCallback((activities) => {
        if (!Array.isArray(activities)) return [];

        const filtered = activities.filter(activity => {
            if (!activity) return false;

            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = matchesSearchQuery(activity, query);
            const matchesType = !typeFilter || activity.typeName === typeFilter;
            const matchesStatus = !statusFilter || activity.statusName === statusFilter;

            let matchesParticipation = true;
            if (participationFilter === 'registered') {
                matchesParticipation = activity.isRegistered;
            } else if (participationFilter === 'completed') {
                matchesParticipation = activity.participationStatus === 'completed';
            } else if (participationFilter === 'not_registered') {
                matchesParticipation = !activity.isRegistered;
            }

            return matchesSearch && matchesType && matchesStatus && matchesParticipation;
        });

        if (!sortBy) return filtered;

        return [...filtered].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'title':
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
                    break;
                case 'startTime':
                    aValue = new Date(a.startTime || 0);
                    bValue = new Date(b.startTime || 0);
                    break;
                case 'endTime':
                    aValue = new Date(a.endTime || 0);
                    bValue = new Date(b.endTime || 0);
                    break;
                case 'type':
                    aValue = (a.typeName || '').toLowerCase();
                    bValue = (b.typeName || '').toLowerCase();
                    break;
                case 'status':
                    aValue = (a.statusName || '').toLowerCase();
                    bValue = (b.statusName || '').toLowerCase();
                    break;
                case 'regisTime':
                    aValue = new Date(a.regisTime || 0);
                    bValue = new Date(b.regisTime || 0);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortOrder === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [
        searchQuery, typeFilter, statusFilter, participationFilter,
        sortBy, sortOrder, matchesSearchQuery
    ]);

    const sortConfig = useMemo(() => ({
        field: sortBy,
        direction: sortOrder
    }), [sortBy, sortOrder]);

    const handleSort = useCallback((field, direction) => {
        setSortBy(field);
        setSortOrder(direction);
    }, []);

    const resetFilters = useCallback(() => {
        setSearchQuery("");
        setTypeFilter("");
        setStatusFilter("");
        setParticipationFilter("all");
        setSortBy("");
        setSortOrder("asc");
        setCurrentPageState(1);

        navigate({
            pathname: location.pathname,
            search: ""
        });
    }, [navigate, location.pathname]);

    const hasActiveFilters = useMemo(() => {
        return !!(
            searchQuery || typeFilter || statusFilter ||
            (participationFilter !== "all") || sortBy
        );
    }, [
        searchQuery, typeFilter, statusFilter, participationFilter, sortBy
    ]);

    const getFilterInfo = useCallback(() => ({
        ประเภท: typeFilter,
        สถานะ: statusFilter,
        การเข้าร่วม: participationFilter === 'registered' ? 'ลงทะเบียนแล้ว' :
            participationFilter === 'completed' ? 'เข้าร่วมสำเร็จ' :
                participationFilter === 'not_registered' ? 'ยังไม่ลงทะเบียน' : 'ทั้งหมด',
        คำค้นหา: searchQuery
    }), [
        typeFilter, statusFilter, participationFilter, searchQuery
    ]);

    return {
        searchQuery,
        setSearchQuery,
        typeFilter,
        setTypeFilter,
        statusFilter,
        setStatusFilter,
        participationFilter,
        setParticipationFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        currentPage,
        setCurrentPage,
        sortConfig,
        hasActiveFilters,
        getFilteredAndSortedActivities,
        handleSort,
        resetFilters,
        getFilterInfo
    };
};