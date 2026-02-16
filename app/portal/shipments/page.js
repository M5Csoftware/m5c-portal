"use client";
import { useContext, useState, useRef, useEffect } from "react";
import ShipNav from "./ShipNav";
import Shipments from "./Shipments";
import FilterShipment from "./FilterShipment";
import { GlobalContext } from "../GlobalContext";
import Manifest, {
  ManifestSuccessModal,
} from "../component/Create Manifest/Manifest";
import PickupAndManifest from "./PickupAndManifest";
import UploadModal from "./UploadModal";
import Dispatch, { DisptchedSuccessModal } from "../component/Dispatch";
import BulkActionsBar from "./BulkActionsBar";
import ActiveFilters from "./ActiveFilters"; // New component for active filters

// Initial date range (normalized to start/end of day for stability)
const getInitialDateRange = () => {
  const start = new Date();
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return [
    {
      startDate: start,
      endDate: end,
      key: "selection",
    },
  ];
};

const INITIAL_DATE_RANGE = getInitialDateRange();

const Page = () => {
  const {
    showSuccessModal,
    setShowSuccessModal,
    manifestNumber,
    manifestOpen,
    selectedLi,
    showBulkUpload,
    toggleBulkUpload,
    dispatchOpen,
    setDisptchedSuccessModal,
    disptchedSuccessModal,
    selectedAwbs,
    setSelectedAwbs,
    setManifestOpen,
    setDisptchedOpen,
    setSelectedLi,
    setStatusFilter,
    setFilters,
    filters,
  } = useContext(GlobalContext);

  const [totalShipments, setTotalShipments] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Create ref for the download function
  const downloadExcelRef = useRef(null);

  // Show/hide bulk actions bar based on selection
  useEffect(() => {
    if (selectedAwbs && selectedAwbs.length > 0) {
      setShowBulkActions(true);
    } else {
      setShowBulkActions(false);
    }
  }, [selectedAwbs]);

  // Update selected count from shipments
  useEffect(() => {
    if (selectedAwbs) {
      setSelectedCount(selectedAwbs.length);
    }
  }, [selectedAwbs]);

  // Handler for search from ShipNav
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  // Handler for setting up download function from Shipments
  const handleDownloadSetup = (downloadFunction) => {
    downloadExcelRef.current = downloadFunction;
  };

  // Handler for download button click
  const handleDownload = () => {
    if (downloadExcelRef.current) {
      downloadExcelRef.current();
    }
  };

  // Handler for selecting mode toggle
  const handleSelectModeToggle = () => {
    setIsSelectMode(!isSelectMode);
    if (!isSelectMode) {
      // When entering select mode, clear previous selections
      setSelectedAwbs([]);
    }
  };

  // Handler for bulk manifest creation
  const handleBulkManifest = () => {
    if (!selectedAwbs || selectedAwbs.length === 0) {
      alert("Please select at least one shipment first.");
      return;
    }
    setManifestOpen(true);
  };

  // Handler for bulk dispatch
  const handleBulkDispatch = () => {
    if (!selectedAwbs || selectedAwbs.length === 0) {
      alert("Please select at least one shipment first.");
      return;
    }
    setDisptchedOpen(true);
  };

  // Handler for bulk download labels
  const handleBulkDownloadLabels = () => {
    if (!selectedAwbs || selectedAwbs.length === 0) {
      alert("Please select at least one shipment first.");
      return;
    }
    alert(`Downloading labels for ${selectedAwbs.length} shipments...`);
    // You can implement bulk label download logic here
  };

  // Handler for clearing selection
  const handleClearSelection = () => {
    setSelectedAwbs([]);
    setShowBulkActions(false);
  };

  // Handler for select all
  const handleSelectAll = (allAwbs) => {
    if (allAwbs && allAwbs.length > 0) {
      setSelectedAwbs([...allAwbs]);
    }
  };

  // Handler for deselect all
  const handleDeselectAll = () => {
    setSelectedAwbs([]);
  };

  // Handler for clearing all filters (Master Reset)
  const handleClearFilters = () => {
    // 1. Reset Global Context filters
    setFilters({
      filterType: "All",
      m5Coin: false,
      rto: false,
      inTransit: false,
      delivered: false,
      priceRange: [0, 100000], // Updated to match GlobalContext defaults
      weightRange: [0.5, 50.0], // Updated to match GlobalContext defaults
      paymentMethod: null,
      service: null,
      country: null,
      consignmentType: null,
    });

    // 2. Reset Tab Selection
    setSelectedLi(0);

    // 3. Reset Status Filter (for Manifest tab dropdowns etc)
    setStatusFilter("All");

    // 4. Reset Local Search Term
    setSearchTerm("");

    // 5. Reset Local Date Range
    setDateRange(INITIAL_DATE_RANGE);
  };

  // Date range state
  const [dateRange, setDateRange] = useState(INITIAL_DATE_RANGE);

  // Handler for date range change
  const handleDateRangeChange = (item) => {
    setDateRange(item);
  };

  return (
    <main className="w-full px-9 flex flex-col relative">
      <h1 className="font-bold text-2xl text-[#18181B] sticky top-[74px] bg-[#f8f9fa]">
        Shipments
      </h1>

      {/* Pass search handler and download handler to ShipNav */}
      <div className="">
        <ShipNav
          totalShipments={totalShipments}
          onDownload={handleDownload}
          selectedCount={selectedCount}
          onSearch={handleSearch}
          isSelectMode={isSelectMode}
          onSelectModeToggle={handleSelectModeToggle}
          onBulkManifest={handleBulkManifest}
          onBulkDispatch={handleBulkDispatch}
          onClearFilters={handleClearFilters}
          onDateRangeChange={handleDateRangeChange}
          searchTerm={searchTerm}
          dateRange={dateRange}
          initialDateRange={INITIAL_DATE_RANGE}
        />
      </div>

      {/* Active Filters Display */}
      <ActiveFilters
        onClear={handleClearFilters}
        searchTerm={searchTerm}
        dateRange={dateRange}
        initialDateRange={INITIAL_DATE_RANGE}
      />

      {/* Bulk Actions Bar */}
      {showBulkActions && selectedAwbs && selectedAwbs.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedAwbs.length}
          onBulkManifest={handleBulkManifest}
          onBulkDispatch={handleBulkDispatch}
          onBulkDownloadLabels={handleBulkDownloadLabels}
          onClearSelection={handleClearSelection}
        />
      )}
      <div className="mt-4 z-10">
        {selectedLi == 3 ? (
          <PickupAndManifest statusFilter={"drop"} />
        ) : (
          <Shipments
            setTotalShipments={setTotalShipments}
            searchTerm={searchTerm}
            onDownloadSetup={handleDownloadSetup}
            onSelectedCountChange={setSelectedCount}
            isSelectMode={isSelectMode}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            dateRange={dateRange}
          />
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg z-[100] fixed top-0 bottom-0 right-0 ">
        <FilterShipment />
      </div>

      {manifestOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <Manifest />
        </div>
      )}

      {dispatchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <Dispatch />
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <ManifestSuccessModal
            manifestNumber={manifestNumber}
            onClose={() => setShowSuccessModal(false)}
          />
        </div>
      )}

      {disptchedSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <DisptchedSuccessModal
            manifestNumber={manifestNumber}
            onClose={() => setDisptchedSuccessModal(false)}
          />
        </div>
      )}

      {showBulkUpload && <UploadModal onClose={toggleBulkUpload} />}
    </main>
  );
};

export default Page;
