"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import ShipmentCard from "./ShipmentCard";
import "./style.css";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";

const Shipments = ({
  setTotalShipments,
  searchTerm,
  onDownloadSetup,
  onSelectedCountChange,
  dateRange,
}) => {
  const [shipmentsData, setShipmentsData] = useState([]);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const { setAccountCode, setSelectedAwbs, server, selectedLi, filters } =
    useContext(GlobalContext);
  const { data: session } = useSession();

  // Calculate the index range for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Fetch shipments based on selected tab and date range
  useEffect(() => {
    setAccountCode(session?.user?.accountCode);

    const fetchShipments = async () => {
      setIsLoading(true);
      try {
        let url;
        let response;
        let type;

        // Determine the type based on selectedLi
        switch (selectedLi) {
          case 0:
            type = "all";
            break;
          case 1:
            type = "latest";
            break;
          case 2:
            type = "ready-to-ship";
            break;
          case 3:
            type = "manifest";
            break;
          case 4:
            type = "intransit";
            break;
          case 5:
            type = "hold";
            break;
          case 6:
            type = "rto";
            break;
          case 7:
            type = "delivered";
            break;
          default:
            type = "all";
        }

        // For tabs that use the getAllShipments endpoint
        if ([0, 1, 4, 5, 6, 7].includes(selectedLi)) {
          url = `${server}/portal/get-delivered-shipments?accountCode=${session?.user?.accountCode}&type=${type}`;
          
          // Add date range for applicable tabs (not for Latest tab)
          if (selectedLi !== 1) {
            const startDate = dateRange?.[0]?.startDate?.toISOString();
            const endDate = dateRange?.[0]?.endDate?.toISOString();
            
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;
          }
          
          response = await axios.get(url);
          
          const shipments = response.data.shipments || [];
          setShipmentsData(shipments);
          setTotalShipments(response.data.total || shipments.length);
          console.log(`${type} shipments:`, shipments.length);
        } 
        // For Ready to Ship and Manifest tabs (use regular get-shipments)
        else {
          url = `${server}/portal/get-shipments?accountCode=${session?.user?.accountCode}`;
          
          // Add date range filter
          const startDate = dateRange?.[0]?.startDate?.toISOString();
          const endDate = dateRange?.[0]?.endDate?.toISOString();
          
          if (startDate) url += `&startDate=${startDate}`;
          if (endDate) url += `&endDate=${endDate}`;
          
          response = await axios.get(url);
          
          let shipments = response.data.shipments || response.data.shipment || [];
          shipments = Array.isArray(shipments) ? shipments : [shipments];
          
          // Additional filtering for specific tabs
          if (selectedLi === 2) { // Ready to Ship
            shipments = shipments.filter(s => s.status === "Ready to Ship");
          } else if (selectedLi === 3) { // Manifest
            shipments = shipments.filter(s => s.manifestNo != null);
          }
          
          setShipmentsData(shipments);
          setTotalShipments(shipments.length);
          console.log(`${type} shipments:`, shipments.length);
        }
      } catch (error) {
        console.error("Error fetching shipments:", error.response?.data || error.message);
        setShipmentsData([]);
        setTotalShipments(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.accountCode) {
      fetchShipments();
    }
  }, [
    server,
    session?.user?.accountCode,
    setAccountCode,
    setTotalShipments,
    selectedLi,
    dateRange,
  ]);

  // Search and filter logic
  const filteredShipments = useMemo(() => {
    let filtered = shipmentsData.filter((shipment) => {
      // 1. Status filtering based on selectedLi (TABS)
      let statusMatch = true;
      switch (selectedLi) {
        case 0: // All
        case 1: // Latest
          statusMatch = true;
          break;
        case 2: // Ready to Ship
          statusMatch = shipment.status === "Ready to Ship";
          break;
        case 3: // Manifest - show all shipments with manifestNo
          statusMatch = shipment.manifestNo != null;
          break;
        case 4: // In Transit
          statusMatch = shipment.status === "In Transit";
          break;
        case 5: // HOLD TAB
          statusMatch = shipment.status === "Hold";
          break;
        case 6: // RTO
          statusMatch = shipment.status === "RTO";
          break;
        case 7: // DELIVERED TAB
          statusMatch = shipment.status === "Delivered";
          break;
        default:
          statusMatch = true;
      }

      if (!statusMatch) return false;

      // 2. Search filtering
      const searchMatch =
        searchTerm === "" ||
        shipment.awbNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.receiverFullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        shipment.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.shipperFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.shipperName?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // 3. Apply filters from FilterShipment panel ONLY on "ALL" and "Latest" TAB
      if (selectedLi === 0 || selectedLi === 1) {
        // Filter by type (All, Invoiced, New)
        if (filters.filterType !== "All") {
          if (filters.filterType === "Invoiced" && !shipment.invoiced) {
            return false;
          }
          if (filters.filterType === "New" && !shipment.isNew) {
            return false;
          }
        }

        // Filter by M5 Coin Discount
        if (filters.m5Coin && !shipment.m5CoinDiscount) {
          return false;
        }

        // Filter by RTO
        if (filters.rto && !shipment.appliedForRTO) {
          return false;
        }

        // Filter by in-transit from panel
        if (filters.inTransit && shipment.status !== "In Transit") {
          return false;
        }

        // Filter by delivered from panel
        if (filters.delivered && shipment.status !== "Delivered") {
          return false;
        }

        // Filter by price range
        if (shipment.totalAmt) {
          const price = parseFloat(shipment.totalAmt);
          if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
            return false;
          }
        }

        // Filter by weight range
        if (shipment.chargeableWt) {
          const weight = parseFloat(shipment.chargeableWt);
          if (
            weight < filters.weightRange[0] ||
            weight > filters.weightRange[1]
          ) {
            return false;
          }
        }

        // Filter by payment method
        if (
          filters.paymentMethod &&
          shipment.paymentDetails?.mode !== filters.paymentMethod.value
        ) {
          return false;
        }

        // Filter by service
        if (filters.service && shipment.service !== filters.service.value) {
          return false;
        }

        // Filter by country
        if (
          filters.country &&
          shipment.receiverCountry !== filters.country.value
        ) {
          return false;
        }

        // Filter by consignment type
        if (filters.consignmentType) {
          if (
            filters.consignmentType.value === "consignee" &&
            !shipment.isConsignee
          ) {
            return false;
          }
          if (
            filters.consignmentType.value === "consigner" &&
            !shipment.isConsigner
          ) {
            return false;
          }
        }
      }

      return true;
    });

    return filtered;
  }, [shipmentsData, selectedLi, searchTerm, filters]);

  const currentItems = filteredShipments.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Update selected count when selection changes
  useEffect(() => {
    if (onSelectedCountChange) {
      onSelectedCountChange(selectedShipments.length);
    }
  }, [selectedShipments, onSelectedCountChange]);

  const handleCheckboxChange = (id) => {
    setSelectedShipments((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((shipmentId) => shipmentId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // Download functionality
  const downloadExcel = () => {
    // Determine which shipments to download
    const shipmentsToDownload =
      selectedShipments.length > 0
        ? shipmentsData.filter((shipment) =>
            selectedShipments.includes(shipment._id),
          )
        : filteredShipments;

    if (shipmentsToDownload.length === 0) {
      alert("No shipments to download");
      return;
    }

    // Prepare data for Excel
    const excelData = shipmentsToDownload.map((shipment) => ({
      "AWB Number": shipment.awbNo || "",
      "Created Date": shipment.createdAt
        ? new Date(shipment.createdAt).toLocaleDateString()
        : "",
      "Delivery Date": shipment.deliveryDate
        ? new Date(shipment.deliveryDate).toLocaleDateString()
        : shipment.updatedAt
          ? new Date(shipment.updatedAt).toLocaleDateString()
          : "",
      Service: shipment.service || "",
      "Total Boxes": shipment.pcs || "",
      "Chargeable Weight": `${shipment.chargeableWt || 0} kg`,
      "Actual Weight": `${shipment.totalActualWt || 0} kg`,
      "Volume Weight": `${shipment.totalVolWt || 0} kg`,
      "Invoice Value": `₹${shipment.totalInvoiceValue || 0}`,
      "Consignor Name": shipment.shipperFullName || "",
      "Consignor Phone": shipment.shipperPhoneNumber || "",
      "Consignor Address": shipment.shipperAddressLine1 || "",
      "Consignor City": shipment.shipperCity || "",
      "Consignee Name":
        shipment.receiverFullName || shipment.receiverName || "",
      "Consignee Phone": shipment.receiverPhoneNumber || "",
      "Consignee Address": shipment.receiverAddressLine1 || "",
      "Consignee City": shipment.receiverCity || "",
      Status: shipment.status || "",
      "Total Amount": `₹${shipment.totalAmt || 0}`,
      "Payment Mode": shipment.paymentDetails?.mode || "Pending",
      "Receiver Name": shipment.receiverName || "",
      Remark: shipment.deliveredEvent?.remark || shipment.eventInfo?.remark || shipment.remark || "",
      "Manifest Number": shipment.manifestNo || "",
      "Run Number": shipment.runNo || "",
      "Club Number": shipment.clubNo || "",
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Shipments");

    // Generate Excel file and download
    const tabNames = ["All", "Latest", "Ready_to_Ship", "Manifest", "In_Transit", "Hold", "RTO", "Delivered"];
    const fileName = selectedShipments.length > 0
      ? `Selected_Shipments_${tabNames[selectedLi]}_${new Date().toISOString().split("T")[0]}.xlsx`
      : `${tabNames[selectedLi]}_Shipments_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  // Pass download function to parent
  useEffect(() => {
    if (onDownloadSetup) {
      onDownloadSetup(() => downloadExcel);
    }
  }, [
    onDownloadSetup,
    shipmentsData,
    selectedShipments,
    filteredShipments,
    selectedLi,
  ]);

  const handleDeleteSelected = () => {
    setShipmentsData((prevShipments) =>
      prevShipments.filter(
        (shipment) => !selectedShipments.includes(shipment._id),
      ),
    );
    setSelectedShipments([]);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredShipments.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    const selectedAWBNumbers = shipmentsData
      .filter((shipment) => selectedShipments.includes(shipment._id))
      .map((shipment) => shipment.awbNo)
      .filter(Boolean);

    setSelectedAwbs(selectedAWBNumbers);
  }, [selectedShipments, shipmentsData, setSelectedAwbs]);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedShipments(currentItems.map((shipment) => shipment._id));
    } else {
      setSelectedShipments([]);
    }
  };

  // Check if all current items are selected
  const isAllSelected = currentItems.length > 0 && 
    currentItems.every(item => selectedShipments.includes(item._id));

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="sticky top-[150px] bg-[#f8f9fa] z-0">
        <ul
          style={{ boxShadow: "0 2px 10px 0px rgba(0, 0, 0, 0.1)" }}
          className="flex justify-between bg-white border border-[#E2E8F0] rounded-[4px] shipment-detail-ul text-left p-4 text-[#A0AEC0] text-sm items-center"
        >
          <li style={{ width: "10px" }}>
            <input
              type="checkbox"
              name="select-all"
              id="select-all"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="cursor-pointer"
            />
          </li>
          <li className="text-center">AWB Number</li>
          <li>Shipment Details</li>
          <li>Consignor Details</li>
          <li>Consignee Details</li>
          <li>Package Details</li>
          <li className="text-center">Payment Details</li>
          <li className="text-center">Status</li>
          <li className="text-center">Action</li>
          <span className="px-4"></span>
        </ul>
      </div>
      
      <div className="flex flex-col gap-2 overflow-y-auto table-scrollbar h-[310px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
            <span className="ml-2 text-gray-500">Loading shipments...</span>
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((shipment) => (
            <ShipmentCard
              key={shipment._id}
              shipmentData={shipment}
              selected={selectedShipments.includes(shipment._id)}
              onCheckboxChange={handleCheckboxChange}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-center mt-4">
              {searchTerm
                ? "No shipments match your search."
                : selectedLi === 7
                  ? "No delivered shipments found in the selected date range."
                  : selectedLi === 4
                    ? "No in-transit shipments found in the selected date range."
                    : selectedLi === 6
                      ? "No RTO shipments found in the selected date range."
                      : selectedLi === 5
                        ? "No hold shipments found."
                        : selectedLi === 2
                          ? "No ready to ship shipments found."
                          : selectedLi === 3
                            ? "No manifest shipments found."
                            : "No shipments found in the selected date range."}
            </p>
          </div>
        )}
      </div>
      
      {filteredShipments.length > 0 && (
        <div
          style={{ boxShadow: "0 0 10px 1px rgba(0, 0, 0, 0.1)" }}
          className="shadow-md flex sticky bottom-2 left-0 right-0 justify-between items-center my-4 text-[#A0AEC0] px-4 py-1 text-sm rounded-lg bg-white"
        >
          <div className="flex items-center">
            <label htmlFor="itemsPerPage" className="text-[#A0AEC0] mr-2">
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded px-2 py-1 text-gray-700"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-4 text-sm text-gray-600">
              Showing {filteredShipments.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredShipments.length)} of{" "}
              {filteredShipments.length} shipments
            </span>
          </div>
          <div className="flex items-center">
            <button
              className="text-[#A0AEC0] px-4 py-2 rounded mr-2 disabled:opacity-50 hover:text-gray-700 transition-colors"
              onClick={handlePrevPage}
              disabled={currentPage === 1 || filteredShipments.length === 0}
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {Math.ceil(filteredShipments.length / itemsPerPage)}
            </span>
            <button
              className="text-[#A0AEC0] px-4 py-2 rounded ml-2 disabled:opacity-50 hover:text-gray-700 transition-colors"
              onClick={handleNextPage}
              disabled={
                currentPage ===
                  Math.ceil(filteredShipments.length / itemsPerPage) ||
                filteredShipments.length === 0
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;