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
import BulkActionsBar from "./BulkActionsBar"; // New component for bulk actions

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
    setDisptchedOpen
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

  return (
    <main className="w-full px-9 flex flex-col relative">
      <h1 className="font-bold text-2xl text-[#18181B] sticky top-[74px] bg-[#f8f9fa]">
        Shipments
      </h1>
      
      {/* Pass search handler and download handler to ShipNav */}
      <ShipNav 
        totalShipments={totalShipments} 
        onDownload={handleDownload}
        selectedCount={selectedCount}
        onSearch={handleSearch}
        isSelectMode={isSelectMode}
        onSelectModeToggle={handleSelectModeToggle}
        onBulkManifest={handleBulkManifest}
        onBulkDispatch={handleBulkDispatch}
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
        />
      )}

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