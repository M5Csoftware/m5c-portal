'use client'
import React, { useState } from 'react';
import { ChevronDown, Search, Filter, MoreHorizontal, Eye, Edit } from 'lucide-react';

const DataTable = ({ 
  columns = [], 
  data = [], 
  title = "Data Table",
  showSearch = true,
  showFilter = true,
  showActions = true,
  onRowClick = null,
  actionButtons = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(sortedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const StatusBadge = ({ status }) => {
    const getStatusStyle = (status) => {
      switch (status?.toLowerCase()) {
        case 'shipment created':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'in transit':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'delivered':
          return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-md border ${getStatusStyle(status)}`}>
        {status}
      </span>
    );
  };

  const renderCellContent = (value, column) => {
    if (column.type === 'status') {
      return <StatusBadge status={value} />;
    }
    if (column.type === 'currency') {
      return <span className="font-medium text-gray-900">₹ {value?.toLocaleString()}</span>;
    }
    if (column.type === 'date') {
      return <span className="text-gray-600 text-xs">{value}</span>;
    }
    if (column.type === 'link') {
      return <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">{value}</span>;
    }
    if (column.type === 'multiline') {
      const lines = value?.split('\n') || [];
      return (
        <div className="space-y-1">
          {lines.map((line, idx) => (
            <div key={idx} className="text-xs text-gray-600 truncate">{line}</div>
          ))}
        </div>
      );
    }
    return <span className="text-gray-900 text-sm">{value}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-3">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
                />
              </div>
            )}
            {showFilter && (
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container with proper scrolling */}
      <div className="overflow-x-auto max-w-full">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-200 last:border-r-0 ${column.width || 'min-w-[150px]'}`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="truncate">{column.label}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform flex-shrink-0 ${
                        sortConfig.key === column.key && sortConfig.direction === 'desc' 
                          ? 'rotate-180' 
                          : ''
                      }`} />
                    </div>
                  </th>
                ))}
                {showActions && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedRows.has(index) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(row, index)}
                >
                  <td className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => handleRowSelect(index)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className={`px-4 py-3 text-sm text-gray-900 border-r border-gray-100 last:border-r-0 ${column.width || 'min-w-[150px]'}`}
                    >
                      <div className="max-w-[200px]">
                        {renderCellContent(row[column.key], column)}
                      </div>
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-3 text-sm text-gray-500 min-w-[120px]">
                      <div className="flex items-center space-x-2">
                        {actionButtons.length > 0 ? (
                          actionButtons.map((button, btnIndex) => (
                            <button
                              key={btnIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                button.onClick(row, index);
                              }}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${button.className || 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                              {button.label}
                            </button>
                          ))
                        ) : (
                          <>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {sortedData.length} of {data.length} results
            {selectedRows.size > 0 && ` (${selectedRows.size} selected)`}
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors">
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded">1</span>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage component
const ShipmentTable = () => {
  const columns = [
    { key: 'awbNumber', label: 'AWB Number', type: 'link', width: 'w-32' },
    { key: 'shipmentDetails', label: 'Shipment Details', type: 'multiline', width: 'w-48' },
    { key: 'consignorDetails', label: 'Consignor Details', type: 'multiline', width: 'w-48' },
    { key: 'consigneeDetails', label: 'Consignee Details', type: 'multiline', width: 'w-48' },
    { key: 'packageDetails', label: 'Package Details', type: 'multiline', width: 'w-44' },
    { key: 'paymentDetails', label: 'Payment Details', type: 'currency', width: 'w-36' },
    { key: 'status', label: 'Status', type: 'status', width: 'w-36' }
  ];

  const sampleData = [
    {
      awbNumber: 'MPL1111120',
      shipmentDetails: '11:54 pm, 3 July 2024\nCourier: Aramex Intern...\nCharged Wgt: 12.5 Kg',
      consignorDetails: 'Shivenk - +91 9997163945\nAddress Line 1 - abc 122 gulf...\n201301 - Delhi - India',
      consigneeDetails: 'Shivenk - +91 9997163945\nAddress Line 1 - abc 122 gulf...\nZirakpur - City - Country',
      packageDetails: 'Act Wt: 10kg, Vol Wt: 12kg\nInvoice Value: ₹18000\nQTY: 20, Box: 2',
      paymentDetails: 70000.00,
      status: 'Shipment Created'
    },
    {
      awbNumber: 'MPL1111121',
      shipmentDetails: '10:30 am, 4 July 2024\nCourier: Blue Dart Express\nCharged Wgt: 8.2 Kg',
      consignorDetails: 'Rajesh Kumar - +91 9988776655\nAddress Line 1 - 110 mall road...\n110001 - Delhi - India',
      consigneeDetails: 'Priya Sharma - +91 9876543210\nAddress Line 2 - 560 tech park...\nBangalore - KA - India',
      packageDetails: 'Act Wt: 8kg, Vol Wt: 10kg\nInvoice Value: ₹25000\nQTY: 15, Box: 1',
      paymentDetails: 45000.00,
      status: 'In Transit'
    },
    {
      awbNumber: 'MPL1111122',
      shipmentDetails: '2:15 pm, 5 July 2024\nCourier: DHL Express\nCharged Wgt: 15.0 Kg',
      consignorDetails: 'Amit Patel - +91 9123456789\nAddress Line 1 - 400 business hub...\n400001 - Mumbai - India',
      consigneeDetails: 'Sneha Reddy - +91 9345678901\nAddress Line 2 - 600 residential...\nChennai - TN - India',
      packageDetails: 'Act Wt: 15kg, Vol Wt: 18kg\nInvoice Value: ₹35000\nQTY: 25, Box: 3',
      paymentDetails: 85000.00,
      status: 'Delivered'
    },
    {
      awbNumber: 'MPL1111123',
      shipmentDetails: '9:45 am, 6 July 2024\nCourier: FedEx International\nCharged Wgt: 5.5 Kg',
      consignorDetails: 'Vikram Singh - +91 9988554433\nAddress Line 1 - 302 tower plaza...\n226001 - Lucknow - India',
      consigneeDetails: 'Anita Gupta - +91 9876512345\nAddress Line 2 - 380 garden city...\nAhmedabad - GJ - India',
      packageDetails: 'Act Wt: 5kg, Vol Wt: 7kg\nInvoice Value: ₹12000\nQTY: 10, Box: 1',
      paymentDetails: 28000.00,
      status: 'Pending'
    }
  ];

  const actionButtons = [
    {
      label: 'Create Manifest',
      className: 'bg-red-600 text-white hover:bg-red-700 px-3 py-1 text-xs',
      onClick: (row) => console.log('Creating manifest for', row.awbNumber)
    }
  ];

  const handleRowClick = (row, index) => {
    console.log('Row clicked:', row);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-full">
        <DataTable
          title="Shipment Management"
          columns={columns}
          data={sampleData}
          showSearch={true}
          showFilter={true}
          showActions={true}
          onRowClick={handleRowClick}
          actionButtons={actionButtons}
        />
      </div>
    </div>
  );
};

export default ShipmentTable;