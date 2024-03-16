import { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

const useTableFilters = (filterConf) => {
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  
    const initFilters = () => {
        setFilters(filterConf);
        setGlobalFilterValue('');
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };
  
    return {
        filters,
        setFilters,
        globalFilterValue,
        setGlobalFilterValue,
        filtrosAplicados,
        setFiltrosAplicados,
        initFilters,
        onGlobalFilterChange,
    };
};

export default useTableFilters;