// import React, { useEffect, useState, useContext } from "react";
// import Image from "next/image";
// import { useFormData } from "./FormDataContext";
// import { GlobalContext } from "../GlobalContext";
// import { useSession } from "next-auth/react";
// import axios from "axios";

// const SelectService = ({
//   step,
//   onPrev,
//   onNext,
//   chargeableWt,
//   selectedServiceLocal,
//   setSelectedServiceLocal,
//   setValue,
//   watch,
//   destination,
//   destinationFlag,
//   trigger,
//   register,
//   errors,
// }) => {
//   const { formData } = useFormData();
//   const { server } = useContext(GlobalContext);
//   const { data: session } = useSession();

//   const [filteredServicesWithRates, setFilteredServicesWithRates] = useState([]);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [rateError, setRateError] = useState("");

//   const selectedSector = watch("sector");
//   const selectedDestination = watch("destination");
//   const consigneeZipcode = watch("receiverPincode");
//   const actualWt = watch("totalActualWt");
//   const pcs = watch("boxes")?.length || 0;

//   useEffect(() => {
//     setValue("service", selectedServiceLocal);
//   }, [selectedServiceLocal, setValue]);

//   useEffect(() => {
//     if (!formData) return;

//     if (formData.chargeableWt) {
//       setValue("chargeableWt", formData.chargeableWt);
//     }

//     if (formData.service) {
//       setSelectedServiceLocal(formData.service);
//       setValue("service", formData.service);
//     }
//   }, [formData, setValue, setSelectedServiceLocal]);

//   useEffect(() => {
//     register("service", {
//       required: "Please select a service",
//     });
//   }, [register]);

//   // Helper function to safely extract array from API response
//   const extractArrayFromResponse = (response, fieldName) => {
//     if (!response) {
//       console.error(`${fieldName}: Response is null or undefined`);
//       return [];
//     }

//     console.log(`${fieldName} raw response:`, response);

//     // If response is already an array
//     if (Array.isArray(response)) {
//       console.log(`${fieldName}: Response is already an array with ${response.length} items`);
//       return response;
//     }

//     // Check common nested structures
//     const possibleFields = ['data', 'results', 'items', fieldName.toLowerCase(), 'zones', 'services'];
    
//     for (const field of possibleFields) {
//       if (response[field] && Array.isArray(response[field])) {
//         console.log(`${fieldName}: Found array in response.${field} with ${response[field].length} items`);
//         return response[field];
//       }
//     }

//     console.error(`${fieldName}: Could not find array in response. Response type:`, typeof response);
//     console.error(`${fieldName}: Response keys:`, Object.keys(response));
//     return [];
//   };

//   // Fetch services with rates - Main logic
//   useEffect(() => {
//     const fetchServicesWithRates = async () => {
//       // Validation checks
//       if (!chargeableWt || chargeableWt <= 0) {
//         console.log("Skipping rate fetch: No chargeable weight");
//         setFilteredServicesWithRates([]);
//         return;
//       }

//       if (!selectedSector) {
//         console.log("Skipping rate fetch: No sector selected");
//         setFilteredServicesWithRates([]);
//         return;
//       }

//       if (!selectedDestination) {
//         console.log("Skipping rate fetch: No destination selected");
//         setFilteredServicesWithRates([]);
//         return;
//       }

//       if (!session?.user?.accountCode) {
//         console.log("Skipping rate fetch: No account code");
//         setFilteredServicesWithRates([]);
//         return;
//       }

//       console.log("=== Starting Rate Fetch ===");
//       console.log("Parameters:", {
//         chargeableWt,
//         selectedSector,
//         selectedDestination,
//         accountCode: session.user.accountCode,
//         consigneeZipcode,
//         actualWt,
//         pcs
//       });

//       setIsLoadingRates(true);
//       setRateError("");

//       try {
//         // Step 1: Get zones for selected sector and destination
//         console.log("Step 1: Fetching zones...");
//         const zoneRes = await axios.get(
//           `${server}/zones?sector=${selectedSector}&destination=${selectedDestination}`
//         );
        
//         console.log("Zone API Response:", zoneRes.data);
        
//         // ✅ FIXED: Robust array extraction
//         const zoneData = extractArrayFromResponse(zoneRes.data, "Zones");
        
//         if (zoneData.length === 0) {
//           console.warn("No zones found");
//           setFilteredServicesWithRates([]);
//           setRateError("No zones found for this destination");
//           return;
//         }

//         console.log(`Found ${zoneData.length} zones:`, zoneData);

//         // Step 2: Get shipper tariff (applicable rates for customer)
//         console.log("Step 2: Fetching shipper tariff...");
//         const tariffRes = await axios.get(
//           `${server}/shipper-tariff?accountCode=${session.user.accountCode}`
//         );
        
//         console.log("Tariff API Response:", tariffRes.data);
        
//         // ✅ FIXED: Robust array extraction
//         const tariffServices = extractArrayFromResponse(tariffRes.data, "Tariff Services");

//         if (tariffServices.length === 0) {
//           console.warn("No tariff services found");
//           setFilteredServicesWithRates([]);
//           setRateError("No applicable rates found for your account");
//           return;
//         }

//         console.log(`Found ${tariffServices.length} tariff services:`, tariffServices);

//         // Step 3: Find common services between zones and tariff
//         console.log("Step 3: Finding common services...");
//         const zoneServices = zoneData.map((z) => z.service);
//         console.log("Available zone services:", zoneServices);

//         const commonServices = tariffServices.filter((t) =>
//           zoneServices.includes(t.service)
//         );

//         console.log(`Found ${commonServices.length} common services:`, commonServices);

//         if (commonServices.length === 0) {
//           setFilteredServicesWithRates([]);
//           setRateError("No matching services available for this destination");
//           return;
//         }

//         // Step 4: Get rates for each common service
//         console.log("Step 4: Fetching rates for each service...");
//         const finalRates = [];

//         for (let srv of commonServices) {
//           const zoneInfo = zoneData.find((z) => z.service === srv.service);
//           if (!zoneInfo) {
//             console.warn(`No zone info found for service: ${srv.service}`);
//             continue;
//           }

//           try {
//             // Check if this is Canada/Australia shipment for zipcode-based zones
//             const isCanada = selectedSector?.toLowerCase().includes("ca");
//             const isAustralia = selectedSector?.toLowerCase().includes("aus");
//             const needsZipcode = isCanada || isAustralia;

//             console.log(`Processing ${srv.service}:`, {
//               isCanada,
//               isAustralia,
//               needsZipcode,
//               hasZipcode: !!consigneeZipcode
//             });

//             // Skip if zipcode is needed but not provided
//             if (needsZipcode && (!consigneeZipcode || consigneeZipcode.trim().length < 3)) {
//               console.warn(`Skipping ${srv.service} - zipcode required but not provided`);
//               continue;
//             }

//             // Build query parameters
//             const params = new URLSearchParams({
//               service: srv.service,
//               rateTariff: srv.rateTariff || "",
//               chargeableWt: chargeableWt,
//               actualWt: actualWt || chargeableWt,
//               pcs: pcs || 1,
//               destination: selectedDestination,
//               sector: selectedSector,
//             });

//             if (zoneInfo.zone) {
//               params.append("zone", zoneInfo.zone);
//             }

//             if (needsZipcode && consigneeZipcode) {
//               const cleanedZip = consigneeZipcode.replace(/\s+/g, "").toUpperCase();
//               params.append("zipcode", cleanedZip);
//             }

//             const rateUrl = `${server}/portal/create-shipment/get-rates?${params.toString()}`;
//             console.log(`Fetching rate for ${srv.service}:`, rateUrl);

//             // Fetch rate
//             const rateRes = await axios.get(rateUrl);
//             console.log(`Rate response for ${srv.service}:`, rateRes.data);

//             const rateData = rateRes.data;

//             if (rateData && rateData.rate && Number(rateData.rate) > 0) {
//               let basicAmt = 0.0;

//               // Calculate based on type
//               if (rateData.type === "B") {
//                 basicAmt = rateData.rate * chargeableWt;
//               } else if (rateData.type === "S") {
//                 basicAmt = rateData.rate;
//               }

//               // Calculate GST (9% CGST + 9% SGST = 18% total)
//               const cgst = 0.09;
//               const sgst = 0.09;
//               const cgstAmt = basicAmt * cgst;
//               const sgstAmt = basicAmt * sgst;
//               const grandTotal = basicAmt + cgstAmt + sgstAmt;

//               const serviceRate = {
//                 service: srv.service,
//                 zone: rateData.zoneUsed || zoneInfo.zone,
//                 rate: rateData.rate,
//                 shipper: rateData.shipper || srv.shipper || "Unknown",
//                 type: rateData.type,
//                 network: srv.network || "",
//                 basicAmt: basicAmt.toFixed(2),
//                 cgstAmt: cgstAmt.toFixed(2),
//                 sgstAmt: sgstAmt.toFixed(2),
//                 grandTotal: grandTotal.toFixed(2),
//                 from: srv.from || "",
//                 to: srv.to || "",
//                 isCanadaShipment: rateData.isCanadaShipment || false,
//                 isAustraliaShipment: rateData.isAustraliaShipment || false,
//               };

//               console.log(`Successfully calculated rate for ${srv.service}:`, serviceRate);
//               finalRates.push(serviceRate);
//             } else {
//               console.warn(`No valid rate returned for ${srv.service}:`, rateData);
//             }
//           } catch (error) {
//             console.error(`Error fetching rate for ${srv.service}:`, error);
//             if (error.response) {
//               console.error("Error response:", error.response.data);
//             }
//           }
//         }

//         // Remove duplicates based on service name
//         const uniqueResults = finalRates.filter(
//           (result, index, self) =>
//             index === self.findIndex((r) => r.service === result.service)
//         );

//         console.log(`Final unique services: ${uniqueResults.length}`, uniqueResults);

//         setFilteredServicesWithRates(uniqueResults);

//         if (uniqueResults.length === 0) {
//           setRateError("No rates available for the current weight and destination");
//         }

//       } catch (error) {
//         console.error("=== Error in fetchServicesWithRates ===");
//         console.error("Error:", error);
//         if (error.response) {
//           console.error("Error response data:", error.response.data);
//           console.error("Error response status:", error.response.status);
//         }
//         setFilteredServicesWithRates([]);
//         setRateError(
//           error.response?.data?.error || "Failed to fetch service rates. Please try again."
//         );
//       } finally {
//         setIsLoadingRates(false);
//         console.log("=== Rate Fetch Complete ===");
//       }
//     };

//     fetchServicesWithRates();
//   }, [
//     chargeableWt,
//     selectedSector,
//     selectedDestination,
//     session?.user?.accountCode,
//     server,
//     consigneeZipcode,
//     actualWt,
//     pcs,
//   ]);

//   // Update form values when service is selected
//   useEffect(() => {
//     if (selectedServiceLocal && filteredServicesWithRates.length > 0) {
//       const selectedRate = filteredServicesWithRates.find(
//         (r) => r.service === selectedServiceLocal
//       );

//       if (selectedRate) {
//         console.log("Updating form with selected service:", selectedRate);
//         setValue("basicAmt", Number(selectedRate.basicAmt));
//         setValue("cgst", Number(selectedRate.cgstAmt));
//         setValue("sgst", Number(selectedRate.sgstAmt));
//         setValue("totalAmt", Number(selectedRate.grandTotal));
//         setValue("service", selectedRate.service);
//         setValue("network", selectedRate.network);
//       }
//     }
//   }, [selectedServiceLocal, filteredServicesWithRates, setValue]);

//   const handleNext = async () => {
//     const isValid = await trigger(["service"]);
//     if (!isValid) return;
//     onNext();
//   };

//   return (
//     <div className="bg-white rounded-3xl p-10 max-w-full">
//       <div className="flex gap-2 items-center">
//         <div className="relative w-9 h-9">
//           <Image
//             className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
//               step <= 5 ? "opacity-100" : "opacity-0"
//             }`}
//             src="/create-shipment/5.svg"
//             alt="step 5"
//             width={36}
//             height={36}
//           />
//           <Image
//             className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
//               step > 5 ? "opacity-100" : "opacity-0"
//             }`}
//             src="/create-shipment/done-red.svg"
//             alt="step 5"
//             width={36}
//             height={36}
//           />
//         </div>
//         <h2 className="text-base px-2 font-bold">Service Selection</h2>
//       </div>

//       <div
//         className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
//           step === 5 ? "max-h-[10000px]" : "max-h-0"
//         }`}
//       >
//         <div className="flex items-center gap-8 px-2 py-6 justify-between w-full">
//           {/* Left Flag (India) */}
//           <div className="flex flex-col items-center gap-3">
//             <Image
//               src="/flags/india.svg"
//               alt="India Flag"
//               width={96}
//               height={68}
//             />
//             <p className="text-xl text-[#979797] font-semibold">India</p>
//           </div>

//           <div className="relative flex items-center w-full">
//             <div className="border-2 w-full border-dashed absolute -top-3"></div>
//             {/* Plane Icon in the Middle */}
//             <div className="absolute left-1/2 flex flex-col items-center gap-2 -top-7">
//               <Image
//                 src="/select-service/plane.svg"
//                 alt="Plane Icon"
//                 width={40}
//                 height={40}
//               />
//               {/* Weight Label below the Plane */}
//               <div>
//                 <p className="text-[#979797] text-sm text-center">
//                   {chargeableWt || "0.00"}
//                 </p>
//                 <p className="text-gray-400 text-[10px] text-center">
//                   Chargeable Weight
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Right Flag (Destination) */}
//           <div className="flex flex-col items-center gap-3">
//             <Image
//               src={`/flags/${destinationFlag || "usa"}.svg`}
//               alt={`${destination} Flag`}
//               width={96}
//               height={68}
//             />
//             <p className="text-xl text-nowrap text-[#979797] font-semibold">
//               {destination || "Destination"}
//             </p>
//           </div>
//         </div>

//         <div className="text-xs">
//           {isLoadingRates ? (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-[var(--primary-color)] rounded-full"></div>
//               <p className="ml-4 text-gray-600">Loading available services...</p>
//             </div>
//           ) : rateError ? (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//               <div className="flex items-start gap-3">
//                 <svg
//                   className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 <div>
//                   <p className="text-red-600 font-semibold">{rateError}</p>
//                   <p className="text-sm text-red-500 mt-2">
//                     Please check your inputs or contact support if the issue persists.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ) : filteredServicesWithRates.length === 0 ? (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//               <svg
//                 className="w-12 h-12 text-yellow-500 mx-auto mb-3"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               <p className="text-yellow-800 font-semibold text-base">
//                 No services available
//               </p>
//               <p className="text-sm text-yellow-600 mt-2">
//                 No services found for the selected destination and weight.
//               </p>
//               <p className="text-xs text-yellow-600 mt-1">
//                 Please verify your destination, weight, or consignee postal code.
//               </p>
//             </div>
//           ) : (
//             <div className="flex flex-col gap-4 px-2">
//               {filteredServicesWithRates.map((service, idx) => (
//                 <div
//                   key={idx}
//                   className={`bg-[#F8F9FA] border p-5 rounded-[10px] flex justify-between transition-all ${
//                     selectedServiceLocal === service.service
//                       ? "border-[var(--primary-color)] ring-2 ring-[var(--primary-color)] ring-opacity-50 shadow-md"
//                       : "border-[#E2E8F0] hover:border-gray-300"
//                   }`}
//                 >
//                   <div className="flex flex-col gap-6">
//                     <div className="flex items-center gap-2">
//                       <div className="w-6 h-6">
//                         <Image
//                           src="/select-service/bgplane.svg"
//                           alt="plane icon"
//                           width={24}
//                           height={24}
//                         />
//                       </div>
//                       <p className="font-semibold">{service.service}</p>
//                       {(service.isCanadaShipment || service.isAustraliaShipment) && (
//                         <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                           Zone {service.zone}
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex flex-col gap-3">
//                       <div className="flex flex-col gap-2">
//                         <div className="flex gap-2">
//                           <Image
//                             src="/select-service/clock.svg"
//                             alt="Clock Icon"
//                             width={20}
//                             height={20}
//                           />
//                           <span className="text-[#71717A] font-bold items-center gap-2">
//                             10-12 Days
//                           </span>
//                         </div>

//                         <span className="text-[var(--primary-color)] border border-[var(--primary-color)] rounded-md p-2.5 text-sm flex items-center font-semibold justify-center w-fit">
//                           {service.shipper}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex flex-col items-end justify-between">
//                     <div className="flex flex-col items-end">
//                       <span className="font-bold text-2xl text-[var(--primary-color)]">
//                         ₹ {Number(service.grandTotal).toFixed(2)}
//                       </span>
//                       <span className="text-[var(--primary-color)] font-bold text-sm">
//                         (Incl. GST)
//                       </span>
//                     </div>

//                     <button
//                       type="button"
//                       className="bg-[var(--primary-color)] text-white text-sm font-bold rounded-md px-12 py-3.5 hover:bg-red-700 transition-colors disabled:opacity-50"
//                       onClick={() => {
//                         setSelectedServiceLocal(service.service);
//                       }}
//                     >
//                       {selectedServiceLocal === service.service
//                         ? "Selected ✓"
//                         : "Book Now"}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {errors.service && (
//                 <p className="text-red-600 text-sm px-2 mt-2">
//                   {errors.service.message}
//                 </p>
//               )}
//             </div>
//           )}

//           <div className="flex justify-end mt-6 mr-2">
//             <div className="flex gap-4">
//               <button
//                 className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-3 hover:bg-red-50 transition-colors"
//                 type="button"
//                 onClick={onPrev}
//               >
//                 Back
//               </button>
//               <button
//                 className="bg-[var(--primary-color)] text-white font-semibold rounded-md px-12 py-3 disabled:opacity-50 hover:bg-red-700 transition-colors"
//                 type="button"
//                 disabled={!selectedServiceLocal}
//                 onClick={handleNext}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SelectService;

import React, { useEffect, useState, useContext } from "react";
import Image from "next/image";
import { useFormData } from "./FormDataContext";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";
import axios from "axios";

const SelectService = ({
  step,
  onPrev,
  onNext,
  chargeableWt,
  selectedServiceLocal,
  setSelectedServiceLocal,
  setValue,
  watch,
  destination,
  destinationFlag,
  trigger,
  register,
  errors,
  setFilteredServicesWithRates, // ✅ ADD THIS: Receive setter from parent
}) => {
  const { formData } = useFormData();
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();

  const [localFilteredServices, setLocalFilteredServices] = useState([]); // ✅ Local state for UI
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [rateError, setRateError] = useState("");

  const selectedSector = watch("sector");
  const selectedDestination = watch("destination");
  const consigneeZipcode = watch("receiverPincode");
  const actualWt = watch("totalActualWt");
  const pcs = watch("boxes")?.length || 0;

  useEffect(() => {
    setValue("service", selectedServiceLocal);
  }, [selectedServiceLocal, setValue]);

  useEffect(() => {
    if (!formData) return;

    if (formData.chargeableWt) {
      setValue("chargeableWt", formData.chargeableWt);
    }

    if (formData.service) {
      setSelectedServiceLocal(formData.service);
      setValue("service", formData.service);
    }
  }, [formData, setValue, setSelectedServiceLocal]);

  useEffect(() => {
    register("service", {
      required: "Please select a service",
    });
  }, [register]);

  // Helper function to safely extract array from API response
  const extractArrayFromResponse = (response, fieldName) => {
    if (!response) {
      console.error(`${fieldName}: Response is null or undefined`);
      return [];
    }

    console.log(`${fieldName} raw response:`, response);

    // If response is already an array
    if (Array.isArray(response)) {
      console.log(`${fieldName}: Response is already an array with ${response.length} items`);
      return response;
    }

    // Check common nested structures
    const possibleFields = ['data', 'results', 'items', fieldName.toLowerCase(), 'zones', 'services'];
    
    for (const field of possibleFields) {
      if (response[field] && Array.isArray(response[field])) {
        console.log(`${fieldName}: Found array in response.${field} with ${response[field].length} items`);
        return response[field];
      }
    }

    console.error(`${fieldName}: Could not find array in response. Response type:`, typeof response);
    console.error(`${fieldName}: Response keys:`, Object.keys(response));
    return [];
  };

  // Fetch services with rates - Main logic
  useEffect(() => {
    const fetchServicesWithRates = async () => {
      // Validation checks
      if (!chargeableWt || chargeableWt <= 0) {
        console.log("Skipping rate fetch: No chargeable weight");
        setLocalFilteredServices([]);
        setFilteredServicesWithRates([]); // ✅ Update parent state
        return;
      }

      if (!selectedSector) {
        console.log("Skipping rate fetch: No sector selected");
        setLocalFilteredServices([]);
        setFilteredServicesWithRates([]); // ✅ Update parent state
        return;
      }

      if (!selectedDestination) {
        console.log("Skipping rate fetch: No destination selected");
        setLocalFilteredServices([]);
        setFilteredServicesWithRates([]); // ✅ Update parent state
        return;
      }

      if (!session?.user?.accountCode) {
        console.log("Skipping rate fetch: No account code");
        setLocalFilteredServices([]);
        setFilteredServicesWithRates([]); // ✅ Update parent state
        return;
      }

      console.log("=== Starting Rate Fetch ===");
      console.log("Parameters:", {
        chargeableWt,
        selectedSector,
        selectedDestination,
        accountCode: session.user.accountCode,
        consigneeZipcode,
        actualWt,
        pcs
      });

      setIsLoadingRates(true);
      setRateError("");

      try {
        // Step 1: Get zones for selected sector and destination
        console.log("Step 1: Fetching zones...");
        const zoneRes = await axios.get(
          `${server}/zones?sector=${selectedSector}&destination=${selectedDestination}`
        );
        
        console.log("Zone API Response:", zoneRes.data);
        
        // ✅ FIXED: Robust array extraction
        const zoneData = extractArrayFromResponse(zoneRes.data, "Zones");
        
        if (zoneData.length === 0) {
          console.warn("No zones found");
          setLocalFilteredServices([]);
          setFilteredServicesWithRates([]); // ✅ Update parent state
          setRateError("No zones found for this destination");
          return;
        }

        console.log(`Found ${zoneData.length} zones:`, zoneData);

        // Step 2: Get shipper tariff (applicable rates for customer)
        console.log("Step 2: Fetching shipper tariff...");
        const tariffRes = await axios.get(
          `${server}/shipper-tariff?accountCode=${session.user.accountCode}`
        );
        
        console.log("Tariff API Response:", tariffRes.data);
        
        // ✅ FIXED: Robust array extraction
        const tariffServices = extractArrayFromResponse(tariffRes.data, "Tariff Services");

        if (tariffServices.length === 0) {
          console.warn("No tariff services found");
          setLocalFilteredServices([]);
          setFilteredServicesWithRates([]); // ✅ Update parent state
          setRateError("No applicable rates found for your account");
          return;
        }

        console.log(`Found ${tariffServices.length} tariff services:`, tariffServices);

        // Step 3: Find common services between zones and tariff
        console.log("Step 3: Finding common services...");
        const zoneServices = zoneData.map((z) => z.service);
        console.log("Available zone services:", zoneServices);

        const commonServices = tariffServices.filter((t) =>
          zoneServices.includes(t.service)
        );

        console.log(`Found ${commonServices.length} common services:`, commonServices);

        if (commonServices.length === 0) {
          setLocalFilteredServices([]);
          setFilteredServicesWithRates([]); // ✅ Update parent state
          setRateError("No matching services available for this destination");
          return;
        }

        // Step 4: Get rates for each common service
        console.log("Step 4: Fetching rates for each service...");
        const finalRates = [];

        for (let srv of commonServices) {
          const zoneInfo = zoneData.find((z) => z.service === srv.service);
          if (!zoneInfo) {
            console.warn(`No zone info found for service: ${srv.service}`);
            continue;
          }

          try {
            // Check if this is Canada/Australia shipment for zipcode-based zones
            const isCanada = selectedSector?.toLowerCase().includes("ca");
            const isAustralia = selectedSector?.toLowerCase().includes("aus");
            const needsZipcode = isCanada || isAustralia;

            console.log(`Processing ${srv.service}:`, {
              isCanada,
              isAustralia,
              needsZipcode,
              hasZipcode: !!consigneeZipcode
            });

            // Skip if zipcode is needed but not provided
            if (needsZipcode && (!consigneeZipcode || consigneeZipcode.trim().length < 3)) {
              console.warn(`Skipping ${srv.service} - zipcode required but not provided`);
              continue;
            }

            // Build query parameters
            const params = new URLSearchParams({
              service: srv.service,
              rateTariff: srv.rateTariff || "",
              chargeableWt: chargeableWt,
              actualWt: actualWt || chargeableWt,
              pcs: pcs || 1,
              destination: selectedDestination,
              sector: selectedSector,
            });

            if (zoneInfo.zone) {
              params.append("zone", zoneInfo.zone);
            }

            if (needsZipcode && consigneeZipcode) {
              const cleanedZip = consigneeZipcode.replace(/\s+/g, "").toUpperCase();
              params.append("zipcode", cleanedZip);
            }

            const rateUrl = `${server}/portal/create-shipment/get-rates?${params.toString()}`;
            console.log(`Fetching rate for ${srv.service}:`, rateUrl);

            // Fetch rate
            const rateRes = await axios.get(rateUrl);
            console.log(`Rate response for ${srv.service}:`, rateRes.data);

            const rateData = rateRes.data;

            if (rateData && rateData.rate && Number(rateData.rate) > 0) {
              let basicAmt = 0.0;

              // Calculate based on type
              if (rateData.type === "B") {
                basicAmt = rateData.rate * chargeableWt;
              } else if (rateData.type === "S") {
                basicAmt = rateData.rate;
              }

              // Calculate GST (9% CGST + 9% SGST = 18% total)
              const cgst = 0.09;
              const sgst = 0.09;
              const cgstAmt = basicAmt * cgst;
              const sgstAmt = basicAmt * sgst;
              const grandTotal = basicAmt + cgstAmt + sgstAmt;

              const serviceRate = {
                service: srv.service,
                zone: rateData.zoneUsed || zoneInfo.zone,
                rate: rateData.rate,
                shipper: rateData.shipper || srv.shipper || "Unknown",
                type: rateData.type,
                network: srv.network || "",
                basicAmt: basicAmt.toFixed(2),
                cgstAmt: cgstAmt.toFixed(2),
                sgstAmt: sgstAmt.toFixed(2),
                grandTotal: grandTotal.toFixed(2),
                from: srv.from || "",
                to: srv.to || "",
                isCanadaShipment: rateData.isCanadaShipment || false,
                isAustraliaShipment: rateData.isAustraliaShipment || false,
              };

              console.log(`Successfully calculated rate for ${srv.service}:`, serviceRate);
              finalRates.push(serviceRate);
            } else {
              console.warn(`No valid rate returned for ${srv.service}:`, rateData);
            }
          } catch (error) {
            console.error(`Error fetching rate for ${srv.service}:`, error);
            if (error.response) {
              console.error("Error response:", error.response.data);
            }
          }
        }

        // Remove duplicates based on service name
        const uniqueResults = finalRates.filter(
          (result, index, self) =>
            index === self.findIndex((r) => r.service === result.service)
        );

        console.log(`Final unique services: ${uniqueResults.length}`, uniqueResults);

        setLocalFilteredServices(uniqueResults);
        setFilteredServicesWithRates(uniqueResults); // ✅ Update parent state

        if (uniqueResults.length === 0) {
          setRateError("No rates available for the current weight and destination");
        }

      } catch (error) {
        console.error("=== Error in fetchServicesWithRates ===");
        console.error("Error:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
        }
        setLocalFilteredServices([]);
        setFilteredServicesWithRates([]); // ✅ Update parent state
        setRateError(
          error.response?.data?.error || "Failed to fetch service rates. Please try again."
        );
      } finally {
        setIsLoadingRates(false);
        console.log("=== Rate Fetch Complete ===");
      }
    };

    fetchServicesWithRates();
  }, [
    chargeableWt,
    selectedSector,
    selectedDestination,
    session?.user?.accountCode,
    server,
    consigneeZipcode,
    actualWt,
    pcs,
    setFilteredServicesWithRates, // ✅ Add to dependencies
  ]);

  // Update form values when service is selected
  useEffect(() => {
    if (selectedServiceLocal && localFilteredServices.length > 0) {
      const selectedRate = localFilteredServices.find(
        (r) => r.service === selectedServiceLocal
      );

      if (selectedRate) {
        console.log("Updating form with selected service:", selectedRate);
        setValue("basicAmt", Number(selectedRate.basicAmt));
        setValue("cgst", Number(selectedRate.cgstAmt));
        setValue("sgst", Number(selectedRate.sgstAmt));
        setValue("totalAmt", Number(selectedRate.grandTotal));
        setValue("service", selectedRate.service);
        setValue("network", selectedRate.network);
      }
    }
  }, [selectedServiceLocal, localFilteredServices, setValue]);

  const handleNext = async () => {
    const isValid = await trigger(["service"]);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className="bg-white rounded-3xl p-10 max-w-full">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step <= 5 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/5.svg"
            alt="step 5"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step > 5 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/done-red.svg"
            alt="step 5"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold">Service Selection</h2>
      </div>

      <div
        className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
          step === 5 ? "max-h-[10000px]" : "max-h-0"
        }`}
      >
        <div className="flex items-center gap-8 px-2 py-6 justify-between w-full">
          {/* Left Flag (India) */}
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/flags/india.svg"
              alt="India Flag"
              width={96}
              height={68}
            />
            <p className="text-xl text-[#979797] font-semibold">India</p>
          </div>

          <div className="relative flex items-center w-full">
            <div className="border-2 w-full border-dashed absolute -top-3"></div>
            {/* Plane Icon in the Middle */}
            <div className="absolute left-1/2 flex flex-col items-center gap-2 -top-7">
              <Image
                src="/select-service/plane.svg"
                alt="Plane Icon"
                width={40}
                height={40}
              />
              {/* Weight Label below the Plane */}
              <div>
                <p className="text-[#979797] text-sm text-center">
                  {chargeableWt || "0.00"}
                </p>
                <p className="text-gray-400 text-[10px] text-center">
                  Chargeable Weight
                </p>
              </div>
            </div>
          </div>

          {/* Right Flag (Destination) */}
          <div className="flex flex-col items-center gap-3">
            <Image
              src={`/flags/${destinationFlag || "usa"}.svg`}
              alt={`${destination} Flag`}
              width={96}
              height={68}
            />
            <p className="text-xl text-nowrap text-[#979797] font-semibold">
              {destination || "Destination"}
            </p>
          </div>
        </div>

        <div className="text-xs">
          {isLoadingRates ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-[var(--primary-color)] rounded-full"></div>
              <p className="ml-4 text-gray-600">Loading available services...</p>
            </div>
          ) : rateError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-red-600 font-semibold">{rateError}</p>
                  <p className="text-sm text-red-500 mt-2">
                    Please check your inputs or contact support if the issue persists.
                  </p>
                </div>
              </div>
            </div>
          ) : localFilteredServices.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <svg
                className="w-12 h-12 text-yellow-500 mx-auto mb-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-yellow-800 font-semibold text-base">
                No services available
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                No services found for the selected destination and weight.
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Please verify your destination, weight, or consignee postal code.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 px-2">
              {localFilteredServices.map((service, idx) => (
                <div
                  key={idx}
                  className={`bg-[#F8F9FA] border p-5 rounded-[10px] flex justify-between transition-all ${
                    selectedServiceLocal === service.service
                      ? "border-[var(--primary-color)] ring-2 ring-[var(--primary-color)] ring-opacity-50 shadow-md"
                      : "border-[#E2E8F0] hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6">
                        <Image
                          src="/select-service/bgplane.svg"
                          alt="plane icon"
                          width={24}
                          height={24}
                        />
                      </div>
                      <p className="font-semibold">{service.service}</p>
                      {(service.isCanadaShipment || service.isAustraliaShipment) && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Zone {service.zone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Image
                            src="/select-service/clock.svg"
                            alt="Clock Icon"
                            width={20}
                            height={20}
                          />
                          <span className="text-[#71717A] font-bold items-center gap-2">
                            10-12 Days
                          </span>
                        </div>

                        {/* <span className="text-[var(--primary-color)] border border-[var(--primary-color)] rounded-md p-2.5 text-sm flex items-center font-semibold justify-center w-fit">
                          {service.shipper}
                        </span> */}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-2xl text-[var(--primary-color)]">
                        ₹ {Number(service.grandTotal).toFixed(2)}
                      </span>
                      <span className="text-[var(--primary-color)] font-bold text-sm">
                        (Incl. GST)
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`${
                        selectedServiceLocal === service.service
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-[var(--primary-color)] hover:bg-red-700"
                      } text-white text-sm font-bold rounded-md px-12 py-3.5 transition-colors disabled:opacity-50`}
                      onClick={() => {
                        setSelectedServiceLocal(service.service);
                      }}
                    >
                      {selectedServiceLocal === service.service
                        ? "Selected ✓"
                        : "Book Now"}
                    </button>
                  </div>
                </div>
              ))}
              {errors.service && (
                <p className="text-red-600 text-sm px-2 mt-2">
                  {errors.service.message}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6 mr-2">
            <div className="flex gap-4">
              <button
                className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-3 hover:bg-red-50 transition-colors"
                type="button"
                onClick={onPrev}
              >
                Back
              </button>
              <button
                className="bg-[var(--primary-color)] text-white font-semibold rounded-md px-12 py-3 disabled:opacity-50 hover:bg-red-700 transition-colors"
                type="button"
                disabled={!selectedServiceLocal}
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectService;