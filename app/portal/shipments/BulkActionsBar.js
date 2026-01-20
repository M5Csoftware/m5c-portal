"use client";
import React from "react";
import { Download, Truck, FileText, X } from "lucide-react";

const BulkActionsBar = ({ 
  selectedCount, 
  onBulkManifest, 
  onBulkDispatch, 
  onBulkDownloadLabels, 
  onClearSelection 
}) => {
  return (
    <div className="sticky top-[120px] z-40 mb-4">
      <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">{selectedCount}</span>
            </div>
            <span className="font-semibold text-gray-700">
              {selectedCount} shipment{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              Hold Ctrl/⌘ to select multiple
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onBulkManifest}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            title="Create manifest for selected shipments"
          >
            <FileText size={16} />
            Create Manifest
          </button>
          
          <button
            onClick={onBulkDispatch}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            title="Dispatch selected shipments"
          >
            <Truck size={16} />
            Dispatch Selected
          </button>
          
          <button
            onClick={onBulkDownloadLabels}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            title="Download labels for selected shipments"
          >
            <Download size={16} />
            Download Labels
          </button>
          
          <button
            onClick={onClearSelection}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors ml-2"
            title="Clear selection"
          >
            <X size={16} />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;