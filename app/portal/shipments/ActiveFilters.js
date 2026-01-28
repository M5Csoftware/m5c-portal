"use client";
import React, { useContext } from 'react';
import { GlobalContext } from '../GlobalContext';

function ActiveFilters() {
  const { filters } = useContext(GlobalContext);

  const getActiveFilterCount = () => {
    let count = 0;
    
    if (filters.filterType !== 'All') count++;
    if (filters.m5Coin) count++;
    if (filters.rto) count++;
    if (filters.inTransit) count++;
    if (filters.delivered) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000) count++;
    if (filters.weightRange[0] !== 0.5 || filters.weightRange[1] !== 12.0) count++;
    if (filters.paymentMethod) count++;
    if (filters.service) count++;
    if (filters.country) count++;
    if (filters.consignmentType) count++;
    
    return count;
  };

  const activeCount = getActiveFilterCount();

  if (activeCount === 0) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-700">{activeCount} active filter(s):</span>
          
          {filters.filterType !== 'All' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Type: {filters.filterType}
            </span>
          )}
          
          {filters.paymentMethod && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Payment: {filters.paymentMethod.label}
            </span>
          )}
          
          {filters.service && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Service: {filters.service.label}
            </span>
          )}
          
          {filters.country && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Country: {filters.country.label}
            </span>
          )}
          
          {filters.consignmentType && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Type: {filters.consignmentType.label}
            </span>
          )}
          
          {(filters.m5Coin || filters.rto || filters.inTransit || filters.delivered) && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Status: {
                [filters.m5Coin && 'M5 Coin', 
                 filters.rto && 'RTO', 
                 filters.inTransit && 'In Transit', 
                 filters.delivered && 'Delivered']
                  .filter(Boolean).join(', ')
              }
            </span>
          )}
          
          {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000) && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
            </span>
          )}
          
          {(filters.weightRange[0] !== 0.5 || filters.weightRange[1] !== 12.0) && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Weight: {filters.weightRange[0]}kg - {filters.weightRange[1]}kg
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActiveFilters;