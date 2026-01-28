"use client";
import React, { useEffect, useState } from "react";

const AccountTable = ({
  headers,
  AccountData,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  setItemsPerPage,
  setGlobalSelectedRows,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});

  const totalPages = Math.ceil(AccountData.length / itemsPerPage);

  const handleCheckboxToggle = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelectedRows = {};
    if (newSelectAll) {
      paginatedData.forEach((_, idx) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + idx;
        newSelectedRows[globalIndex] = true;
      });
    }
    setSelectedRows(newSelectedRows);
  };

  useEffect(() => {
    const selected = Object.keys(selectedRows).map((i) => Number(i));
    setGlobalSelectedRows(selected);
  }, [selectedRows, setGlobalSelectedRows]);

  const handleRowCheckboxChange = (index) => {
    const newSelectedRows = { ...selectedRows };
    if (newSelectedRows[index]) {
      delete newSelectedRows[index];
    } else {
      newSelectedRows[index] = true;
    }
    setSelectedRows(newSelectedRows);

    const totalSelectedOnPage = paginatedData.filter(
      (_, idx) => newSelectedRows[(currentPage - 1) * itemsPerPage + idx]
    ).length;

    setSelectAll(totalSelectedOnPage === paginatedData.length);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
    setSelectedRows({}); // Clear selection when page size changes
    setSelectAll(false);
  };

  const paginatedData = AccountData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clear selection when data changes or page changes
  useEffect(() => {
    setSelectedRows({});
    setSelectAll(false);
  }, [currentPage, AccountData]);

  return (
    <div className="w-full">
      {/* Scrollable Table Container */}
      <div className="overflow-x-auto w-[91vw] table-scrollbar">
        <div className="min-w-max">
          {/* Header */}
          <ul className="flex sticky top-0 z-20 bg-white border border-[#E2E8F0] rounded-[4px] drop-shadow-sm p-4 text-[#A0AEC0] text-sm font-semibold items-center">
            <li className="w-[10px] bg-white mr-12">
              <input
                type="checkbox"
                className="h-4 w-4"
                onChange={handleCheckboxToggle}
                checked={selectAll}
              />
            </li>
            {headers.map((header, i) => (
              <li
                key={i}
                className="w-[100px] h-[20px] mr-4 text-wrap truncate text-center"
              >
                {header}
              </li>
            ))}
          </ul>

          {/* Data Rows */}
          <div className="overflow-y-auto overflow-x-hidden max-h-[308px] pt-2 scrollbar-hide">
            {paginatedData.length > 0 ? (
              paginatedData.map((data, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;

                return (
                  <ul
                    key={globalIndex}
                    className="flex bg-white border border-[#E2E8F0] rounded-[4px] drop-shadow-sm p-4 text-[#71717A] text-sm font-normal items-center mb-2"
                  >
                    <li className="w-[10px] bg-white mr-12">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={() => handleRowCheckboxChange(globalIndex)}
                        checked={!!selectedRows[globalIndex]}
                      />
                    </li>
                    {headers.map((header, i) => (
                      <li
                        key={i}
                        className="w-[100px] h-[20px] mr-4 truncate text-wrap text-center"
                      >
                        {data[header] || "-"}
                      </li>
                    ))}
                  </ul>
                );
              })
            ) : (
              <div className="flex justify-center items-center h-24 bg-white border border-[#E2E8F0] rounded-[4px]">
                <p className="text-gray-500">No data found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="shadow-md flex sticky bottom-2 left-0 right-0 justify-between items-center my-4 text-[#A0AEC0] px-4 py-1 text-sm rounded-lg bg-white w-[91vw]">
        <div className="flex items-center">
          <label htmlFor="itemsPerPage" className="text-[#A0AEC0] mr-2">
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
          <span className="ml-4 text-sm">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, AccountData.length)} of {AccountData.length} records
          </span>
        </div>

        <div className="flex items-center">
          <button
            className="text-[#A0AEC0] px-4 py-2 rounded mr-2 disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="text-[#A0AEC0] px-4 py-2 rounded disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTable;