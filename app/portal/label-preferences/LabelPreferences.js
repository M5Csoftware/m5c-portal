"use client";

import { useState, useContext, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import NotificationFlag from "../component/NotificationFlag";

const LabelPreferences = () => {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingLogo, setExistingLogo] = useState(null);
  const [sampleShipment, setSampleShipment] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    subMessage: "",
  });
  const barcodeCanvasRef = useRef();

  useEffect(() => {
    fetchExistingLogo();
    fetchSampleShipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (barcodeCanvasRef.current && sampleShipment?.awbNo) {
      const loadJsBarcode = async () => {
        try {
          const JsBarcode = (await import("jsbarcode")).default;
          JsBarcode(barcodeCanvasRef.current, sampleShipment.awbNo, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 40,
            displayValue: false,
            background: "#ffffff",
            margin: 5,
          });
        } catch (error) {
          console.error("Error generating barcode:", error);
        }
      };
      loadJsBarcode();
    }
  }, [sampleShipment]);

  const fetchExistingLogo = async () => {
    try {
      const accountCode = session?.user?.accountCode;
      if (!accountCode) return;

      const response = await axios.get(
        `${server}/portal/label-preferences?accountCode=${accountCode}`
      );

      if (response.data.success && response.data.data?.logoUrl) {
        setExistingLogo(response.data.data.logoUrl);
        setPreviewUrl(response.data.data.logoUrl);
      }
    } catch (error) {
      console.error("Error fetching existing logo:", error);
    }
  };

  const fetchSampleShipment = async () => {
    try {
      const accountCode = session?.user?.accountCode;
      if (!accountCode) return;

      // Fetch latest shipment for preview
      const response = await axios.get(
        `${server}/portal/get-shipments?accountCode=${accountCode}&limit=1`
      );

      if (response.data && response.data.shipments && response.data.shipments.length > 0) {
        setSampleShipment(response.data.shipments[0]);
      } else {
        // Use fallback data if no shipments found
        setSampleShipment({
          awbNo: "MPP7335294",
          shipperFullName: "SWETA SUBHASH SHARMA",
          shipperAddressLine1: "1 RAMESH APARTMENT",
          shipperAddressLine2: "JESAL PARK NEAR GANES",
          shipperCity: "JAIPUR",
          shipperState: "RAJASTHAN",
          shipperPincode: "403105",
          receiverFullName: "Bhanu Sargadm",
          receiverAddressLine1: "3132, Paola Terrace",
          receiverAddressLine2: "",
          receiverCity: "Dublin",
          receiverState: "CA",
          receiverPincode: "94568",
          service: "EX-DEL-US-PR-GK-UPS",
          shipmentType: "NDDX",
          pcs: 1,
          totalActualWt: 0.220,
          totalVolWt: 0.220,
          date: new Date(),
        });
      }
    } catch (error) {
      console.error("Error fetching sample shipment:", error);
      // Use fallback data on error
      setSampleShipment({
        awbNo: "MPP7335294",
        shipperFullName: "SWETA SUBHASH SHARMA",
        shipperAddressLine1: "1 RAMESH APARTMENT",
        shipperAddressLine2: "JESAL PARK NEAR GANES",
        shipperCity: "JAIPUR",
        shipperState: "RAJASTHAN",
        shipperPincode: "403105",
        receiverFullName: "Bhanu Sargadm",
        receiverAddressLine1: "3132, Paola Terrace",
        receiverAddressLine2: "",
        receiverCity: "Dublin",
        receiverState: "CA",
        receiverPincode: "94568",
        service: "EX-DEL-US-PR-GK-UPS",
        shipmentType: "NDDX",
        pcs: 1,
        totalActualWt: 0.220,
        totalVolWt: 0.220,
        date: new Date(),
      });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only JPG, JPEG, or PNG images.");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB.");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const accountCode = session?.user?.accountCode;
    if (!accountCode) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("accountCode", accountCode);
      formData.append("logo", selectedFile);

      const response = await axios.post(
        `${server}/portal/label-preferences`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setExistingLogo(response.data.data.logoUrl);
        setSelectedFile(null);

        setNotification({
          visible: true,
          message: "Logo Uploaded",
          subMessage: "Your logo has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!sampleShipment) {
    return (
      <div className="w-full px-8 mb-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA1B40] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Create label data from shipment
  const labelData = {
    date: new Date(sampleShipment.date).toLocaleDateString("en-US"),
    from: {
      name: sampleShipment.shipperFullName || "SENDER NAME",
      address: `${sampleShipment.shipperAddressLine1 || ""} ${sampleShipment.shipperAddressLine2 || ""}`.trim() || "SENDER ADDRESS",
      city: sampleShipment.shipperCity || "SENDER CITY",
      state: sampleShipment.shipperState || "SENDER STATE",
      zip: sampleShipment.shipperPincode || "000000",
    },
    to: {
      name: sampleShipment.receiverFullName || "RECEIVER NAME",
      attn: "Attn:",
      address: `${sampleShipment.receiverAddressLine1 || ""} ${sampleShipment.receiverAddressLine2 || ""}`.trim() || "RECEIVER ADDRESS",
      city: sampleShipment.receiverCity || "RECEIVER CITY",
      state: sampleShipment.receiverState || "RECEIVER STATE",
      zip: sampleShipment.receiverPincode || "000000",
    },
    serviceCode: sampleShipment.service || sampleShipment.forwarder || sampleShipment.networkName || "STANDARD SERVICE",
    pageInfo: "1",
    details: {
      type: sampleShipment.shipmentType || "PKG",
      dim: "N/A",
      actWt: `${sampleShipment.totalActualWt || 0} Kg`,
      volWt: `${sampleShipment.totalVolWt || 0} Kg`,
      chgWt: `${Math.max(sampleShipment.totalActualWt || 0, sampleShipment.totalVolWt || 0)} Kg`,
    },
    trackingNumber: sampleShipment.awbNo,
  };

  return (
    <>
      <div className="w-full px-8 mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Label Preferences
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Upload Section */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border max-h-[100vh] border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Upload Logo
              </h2>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="logoInput"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/jpg,image/png"
                />

                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & Drop to Upload File
                    </p>
                    <p className="text-xs text-gray-400">OR</p>
                  </div>

                  <label
                    htmlFor="logoInput"
                    className="px-6 py-2.5 bg-[#EA1B40] hover:bg-red-600 text-white rounded-md cursor-pointer transition-colors font-medium"
                  >
                    Browse File
                  </label>

                  <p className="text-xs text-gray-400">
                    Supported formats: JPG, JPEG, PNG (Max 2MB)
                    <br />
                    Recommended size: 540 x 100 px
                  </p>
                </div>
              </div>

              {/* Logo Preview */}
              {previewUrl && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Logo Preview
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Logo Preview"
                      className="max-h-24 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(existingLogo);
                  }}
                  className="flex-1 px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className={`flex-1 px-5 py-2 rounded-md font-medium transition-colors ${selectedFile && !loading
                    ? "bg-[#EA1B40] hover:bg-red-600 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Label Preview */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[88.5vh] p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Label Preview
              </h2>

              <div className="flex justify-center">
                <div
                  className="bg-white border-2 border-black font-sans text-xs"
                  style={{ width: "350px" }}
                >
                  {/* Header with Logo */}
                  <div className="border-b-2 border-gray-800 p-2 flex flex-col">
                    <div className="font-bold border-b-2 border-black text-lg py-2 flex items-center justify-between">
                      <span>M5C Logistics™</span>
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Company Logo"
                          className="h-8 object-contain max-w-[150px]"
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <span className="font-semibold">Date: </span>
                      {labelData.date}
                    </div>
                  </div>

                  {/* From Section */}
                  <div className="border-b-2 border-black relative">
                    <span className="bg-black text-white px-2 py-1 font-bold absolute top-0 left-0 text-xs">
                      From:
                    </span>
                    <div className="space-y-0.5 leading-tight pt-6 pb-2 px-2 font-bold">
                      <div className="text-xs">{labelData.from.name}</div>
                      <div className="text-xs">{labelData.from.address}</div>
                      <div className="text-xs">
                        {labelData.from.city}, {labelData.from.state}
                      </div>
                      <div className="text-xs">{labelData.from.zip}</div>
                    </div>
                  </div>

                  {/* Service Code */}
                  <div className="p-2 border-b-2 border-black flex justify-between">
                    <div className="font-bold text-xs">
                      {labelData.serviceCode}
                    </div>
                    <div className="font-bold text-xs">
                      {labelData.pageInfo}
                    </div>
                  </div>

                  {/* To + Details */}
                  <div className="border-b-2 border-black">
                    <div className="flex">
                      <div className="flex-1">
                        <span className="bg-black text-white px-2 py-1 font-bold inline-block text-xs">
                          To:
                        </span>
                      </div>
                      <div className="w-32">
                        <span className="bg-black text-white px-2 py-1 font-bold inline-block text-xs">
                          Details
                        </span>
                      </div>
                    </div>

                    <div className="flex font-semibold">
                      <div className="flex-1 p-2 text-xs space-y-0.5 leading-tight">
                        <div className="font-semibold">{labelData.to.name}</div>
                        {labelData.to.attn && <div>{labelData.to.attn}</div>}
                        <div>{labelData.to.address}</div>
                        <div>
                          {labelData.to.city}, {labelData.to.state}
                        </div>
                        <div>{labelData.to.zip}</div>
                      </div>

                      <div className="w-32 p-2 text-xs space-y-0.5 leading-tight border-l border-black">
                        <div>Type: {labelData.details.type}</div>
                        <div>Dim: {labelData.details.dim}</div>
                        <div>Act Wgt: {labelData.details.actWt}</div>
                        <div>Vol Wgt: {labelData.details.volWt}</div>
                        <div>Chg Wgt: {labelData.details.chgWt}</div>
                      </div>
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="relative px-3 py-2 flex flex-col">
                    <div className="flex justify-center">
                      <canvas ref={barcodeCanvasRef}></canvas>
                    </div>
                    <div className="mt-2 flex justify-between items-end">
                      <div className="font-bold text-xs">TRACKING NUMBER</div>
                      <div className="font-bold text-base">
                        {labelData.trackingNumber}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-2 text-center text-xs border-t-2 border-black">
                    Sender warrants that this item does not contain non-mailable
                    matter
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NotificationFlag
        message={notification.message}
        subMessage={notification.subMessage}
        visible={notification.visible}
        setVisible={(visible) =>
          setNotification((prev) => ({ ...prev, visible }))
        }
      />
    </>
  );
};

export default LabelPreferences;