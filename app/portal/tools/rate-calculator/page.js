"use client";
import Image from "next/image";
import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { GlobalContext } from "../../GlobalContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Page = () => {
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [volumetricWeight, setVolumetricWeight] = useState("0.00");
  const [chargeableWeight, setChargeableWeight] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [selectedServiceLocal, setSelectedServiceLocal] = useState();
  const [calculatedRates, setCalculatedRates] = useState([]);
  const router = useRouter();

  // Static sectors data
  const staticSectors = ["UK", "BR", "CANADA", "AUSTRALIA", "USA", "EUROPE"];

  // Dropdown data
  const [availableServices, setAvailableServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);

  // Watch form fields for cascading dropdowns
  const watchSector = watch("sector");
  const watchService = watch("service");

  // 👉 1. Fetch available services for this customer on mount
  useEffect(() => {
    const fetchCustomerServices = async () => {
      if (!session?.user?.accountCode) return;

      setLoadingServices(true);
      try {
        const accountCode = session.user.accountCode;

        // Fetch ShipperTariff for this account
        const response = await axios.get(
          `${server}/shipper-tariff/rate-calc?accountCode=${accountCode}`,
        );

        if (response.data && Array.isArray(response.data)) {
          const allServices = [];
          const currentDate = new Date();

          response.data.forEach((tariff) => {
            if (
              tariff.ratesApplicable &&
              Array.isArray(tariff.ratesApplicable)
            ) {
              tariff.ratesApplicable.forEach((rate) => {
                const fromDate = new Date(rate.from);
                const toDate = new Date(rate.to);

                // Only include services that are currently valid
                if (fromDate <= currentDate && toDate >= currentDate) {
                  allServices.push({
                    service: rate.service,
                    sector: rate.sector,
                    zoneMatrix: rate.zoneMatrix,
                    network: rate.network,
                    rateTariff: rate.rateTariff,
                    mode: rate.mode,
                    from: rate.from,
                    to: rate.to,
                  });
                }
              });
            }
          });

          setAvailableServices(allServices);
          console.log("Available services:", allServices);
        }
      } catch (error) {
        console.error("Error fetching customer services:", error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchCustomerServices();
  }, [session, server]);

  // 👉 2. Filter services when sector changes
  useEffect(() => {
    if (!watchSector || watchSector === "") {
      setFilteredServices([]);
      setValue("service", "");
      setValue("destinationCountry", "");
      setAvailableDestinations([]);
      return;
    }

    console.log("Filtering services for sector:", watchSector);
    console.log("Available services to filter:", availableServices);

    const filtered = availableServices.filter(
      (s) => s.sector?.toUpperCase() === watchSector.toUpperCase(),
    );

    console.log("Filtered services:", filtered);
    setFilteredServices(filtered);

    // Reset dependent fields
    setValue("service", "");
    setValue("destinationCountry", "");
    setAvailableDestinations([]);
  }, [watchSector, availableServices, setValue]);

  // 👉 3. Fetch available destinations when service changes
  useEffect(() => {
    const fetchDestinations = async () => {
      if (!watchSector || !watchService || watchService === "") {
        setAvailableDestinations([]);
        setValue("destinationCountry", "");
        return;
      }

      setLoadingDestinations(true);
      try {
        // Find the selected service details
        const selectedServiceDetails = filteredServices.find(
          (s) => s.service === watchService,
        );

        if (!selectedServiceDetails) {
          console.error("Service details not found for:", watchService);
          console.log("Available filtered services:", filteredServices);
          setAvailableDestinations([]);
          return;
        }

        console.log("Fetching destinations for:", {
          sector: watchSector,
          service: watchService,
          zoneMatrix: selectedServiceDetails.zoneMatrix,
        });

        // Fetch zones for this sector + service combination
        const response = await axios.get(`${server}/zones/destinations`, {
          params: {
            sector: watchSector.toUpperCase(),
            service: watchService.toUpperCase(),
            zoneMatrix: selectedServiceDetails.zoneMatrix,
          },
        });

        console.log("Destinations API response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          // Extract unique destinations and sort
          const destinations = [
            ...new Set(response.data.map((z) => z.destination)),
          ]
            .filter((d) => d && d.trim() !== "")
            .sort();

          setAvailableDestinations(destinations);
          console.log("Available destinations:", destinations);

          // Auto-select if only one destination
          if (destinations.length === 1) {
            setValue("destinationCountry", destinations[0]);
          } else {
            setValue("destinationCountry", "");
          }
        } else {
          console.log("No destinations data returned");
          setAvailableDestinations([]);
        }
      } catch (error) {
        console.error("Error fetching destinations:", error);
        setAvailableDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    };

    if (watchService && filteredServices.length > 0) {
      fetchDestinations();
    }
  }, [watchSector, watchService, filteredServices, server, setValue]);

  // 👉 Calculate rates
  const onSubmit = async (data) => {
    const {
      length,
      width,
      height,
      actualWeight,
      sector,
      destinationCountry,
      service,
    } = data;

    // Validate required fields
    if (!sector || sector === "") {
      alert("Please select a sector");
      return;
    }

    if (!service || service === "") {
      alert("Please select a service");
      return;
    }

    if (!destinationCountry || destinationCountry === "") {
      alert("Please select a destination");
      return;
    }

    // 1️⃣ Calculate volumetric & chargeable weight
    const volumeWeight = (length * width * height) / 5000 || 0;
    const actual = parseFloat(actualWeight) || 0;
    const chargeable = Math.max(volumeWeight, actual, 0.5);

    setVolumetricWeight(volumeWeight.toFixed(2));
    setChargeableWeight(chargeable.toFixed(2));
    setLoading(true);

    try {
      // 2️⃣ Get account code from session
      const accountCode = session?.user?.accountCode || "DEFAULT";

      // 3️⃣ Call the rate calculation endpoint
      const response = await axios.post(
        `${server}/bulk-upload/calculate-rates`,
        {
          shipments: [
            {
              awbNo: `CALC-${Date.now()}`,
              sector: sector.toUpperCase().trim(),
              destination: destinationCountry.toUpperCase().trim(),
              service: service.toUpperCase().trim(),
              chargeableWt: chargeable,
              pcs: 1,
              totalInvoiceValue: 0,
              currency: "INR",
              origin: sector.toUpperCase().trim(),
              goodstype: data.shipmentPurpose || "Commercial",
              receiverPincode: data.destinationZipcode || "",
              receiverCountry: destinationCountry.toUpperCase().trim(),
            },
          ],
          accountCode: accountCode,
        },
      );

      console.log("Rate calculation response:", response.data);

      if (response.data.success && response.data.results) {
        const calculatedRatesData = response.data.results
          .filter((r) => r.success)
          .map((result) => {
            // Find the service details from availableServices
            const serviceDetails = availableServices.find(
              (s) => s.service.toUpperCase() === result.service.toUpperCase(),
            );

            return {
              service: result.service,
              zone: result.zone,
              ratePerKg: result.rateUsed || 0,
              chargeableWt: result.chargeableWt,
              basicAmt: result.basicAmt || 0,
              sgst: result.sgst || 0,
              cgst: result.cgst || 0,
              igst: result.igst || 0,
              totalAmt: result.totalAmt || 0,
              network: serviceDetails?.network || "Standard",
              from: serviceDetails?.from || null,
              to: serviceDetails?.to || null,
              zoneMatrix: serviceDetails?.zoneMatrix || "",
              rateTariff: serviceDetails?.rateTariff || "",
            };
          });

        setCalculatedRates(calculatedRatesData);

        if (calculatedRatesData.length === 0) {
          alert(
            "No rates found for this combination.\n\n" +
              "Please check your zone and rate sheet configuration.",
          );
        }
      } else {
        alert("Failed to calculate rates. Please try again.");
        setCalculatedRates([]);
      }
    } catch (err) {
      console.error("Error calculating rates:", err);

      let errorMessage = "Error calculating rates:\n\n";

      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Unknown error occurred";
      }

      alert(errorMessage);
      setCalculatedRates([]);
    } finally {
      setLoading(false);
    }
  };

  // 👉 Reset Button
  const handleReset = () => {
    reset();
    setVolumetricWeight("0.00");
    setChargeableWeight("0.00");
    setCalculatedRates([]);
    setSelectedServiceLocal(null);
    setFilteredServices([]);
    setAvailableDestinations([]);
  };

  // 👉 Calculate duration
  const calculateDuration = (from, to) => {
    if (!from || !to) return "2-4 Days";
    const start = new Date(from);
    const end = new Date(to);
    let diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) diffDays = 1;
    return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
  };

  return (
    <main className="w-full px-4 bg-[#f9fafb] flex flex-col gap-2">
      <div className="flex justify-between mx-2">
        <h1 className="font-bold text-2xl text-[#18181B]">Rate Calculator</h1>

        {session?.user && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Account:</span>{" "}
              {session.user.accountCode}
              {session.user.name && (
                <span className="ml-4">
                  <span className="font-semibold">User:</span>{" "}
                  {session.user.name}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Session Info */}

      {/* Form Section */}
      <div className="rounded-xl bg-white p-4 flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          {/* Two Column Layout */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Column 1 */}
            <div className="flex flex-col mt-1 gap-2 flex-1">
              {/* Sector Dropdown - STATIC */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Sector *
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Select origin sector (filters services)
                  </p>
                </div>

                <select
                  {...register("sector", { required: true })}
                  className="w-full h-8 px-3 border border-gray-300 rounded-md text-sm outline-none"
                >
                  <option value="">Select a sector</option>
                  {staticSectors.map((sector, idx) => (
                    <option key={idx} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Dropdown */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Service *
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Available services for selected sector
                  </p>
                </div>

                <select
                  {...register("service", { required: true })}
                  className="w-full h-8 px-3 border border-gray-300 rounded-md text-sm outline-none"
                  disabled={!watchSector || filteredServices.length === 0}
                >
                  <option value="">
                    {!watchSector
                      ? "Select sector first"
                      : filteredServices.length === 0
                        ? "No services for this sector"
                        : "Select a service"}
                  </option>
                  {filteredServices.map((service, idx) => (
                    <option key={idx} value={service.service}>
                      {service.service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Dropdown */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Destination Country *
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Destinations with configured zones & rates
                  </p>
                </div>

                <select
                  {...register("destinationCountry", { required: true })}
                  className="w-full h-8 px-3 border border-gray-300 rounded-md text-sm outline-none"
                  disabled={
                    !watchService ||
                    loadingDestinations ||
                    availableDestinations.length === 0
                  }
                >
                  <option value="">
                    {!watchService
                      ? "Select service first"
                      : loadingDestinations
                        ? "Loading destinations..."
                        : availableDestinations.length === 0
                          ? "No destinations for this service"
                          : "Select a destination"}
                  </option>
                  {availableDestinations.map((destination, idx) => (
                    <option key={idx} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actual Weight */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Actual Weight *
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum chargeable weight is 0.500 kg
                  </p>
                </div>

                <div className="relative border border-gray-300 rounded-md">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("actualWeight", { required: true })}
                    className="w-full py-1.5 px-4 pr-12 text-sm outline-none rounded-md"
                  />
                  <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-sm text-gray-500 bg-[#F3F7FE] rounded-r-md">
                    Kg
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-2 flex-1">
              {/* Destination Zipcode */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-600">
                    Destination Zipcode (Optional)
                  </label>
                  <p className="text-xs text-gray-500">
                    Optional: International postal code
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Eg. V5K0A5"
                  {...register("destinationZipcode")}
                  className="border border-gray-300 rounded-md h-8 px-4 text-sm w-full outline-none"
                />
              </div>

              {/* Shipment Purpose */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Shipment Purpose
                </label>
                <select
                  {...register("shipmentPurpose")}
                  className="w-full h-8 px-3 border border-gray-300 rounded-md text-sm outline-none"
                >
                  <option value="Commercial">Commercial</option>
                  <option value="Gift">Gift</option>
                  <option value="Sample">Sample</option>
                </select>
              </div>

              {/* Dimensions */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Dimensions (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    For volumetric weight calculation
                  </p>
                </div>

                <div className="flex gap-4">
                  {["length", "width", "height"].map((dim) => (
                    <div
                      key={dim}
                      className="relative w-full border border-gray-300 rounded-md"
                    >
                      <input
                        type="number"
                        step="0.01"
                        placeholder={dim.charAt(0).toUpperCase() + dim.slice(1)}
                        {...register(dim)}
                        className="w-full py-1.5 px-2 pr-10 text-sm outline-none rounded-md"
                      />
                      <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-sm text-gray-500 bg-[#F3F7FE] rounded-r-md">
                        cm
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weight Result */}
              <div className="flex gap-4 pt-4">
                <div className="bg-yellow-100 text-yellow-800 rounded px-4 py-2 flex items-center text-sm w-full">
                  <strong className="mr-1 font-medium">Volumetric:</strong>
                  {volumetricWeight} kg <span className="ml-2">⚠️</span>
                </div>
                <div className="bg-green-100 text-green-800 rounded px-4 py-2 flex items-center text-sm w-full">
                  <strong className="mr-1 font-medium">Chargeable:</strong>
                  {chargeableWeight} kg <span className="ml-2">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between w-full gap-4">
            <button
              type="submit"
              disabled={loading || loadingServices || loadingDestinations}
              className="bg-[#EA2147] text-white py-2 px-10 rounded-md w-full disabled:opacity-50 font-semibold"
            >
              {loading ? "Calculating..." : "Calculate Rate"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="border border-[#EA2147] text-[#EA2147] py-2 px-10 rounded w-full font-semibold"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Rate Display Section */}

      {calculatedRates.map((service, idx) => (
        <div
          key={idx}
          className={`bg-white border p-4 rounded-[10px] mt-2 ${
            selectedServiceLocal === service?.service
              ? "border-[var(--primary-color)] shadow-lg"
              : "border-[#E2E8F0]"
          }`}
        >
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Image
                src="/select-service/bgplane.svg"
                alt="service icon"
                width={28}
                height={28}
              />
              <div>
                <p className="font-bold text-lg">{service?.service}</p>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <span className="font-bold text-3xl text-[var(--primary-color)]">
                ₹ {Number(service?.totalAmt || 0).toFixed(2)}
              </span>
              <span className="text-[var(--primary-color)] mb-1 font-bold text-sm">
                (Incl. GST)
              </span>
            </div>
          </div>

          {/* Rate Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 pt-2 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500 font-medium">Zone</p>
                <p className="text-sm font-bold text-gray-800">
                  Zone {service?.zone || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium">Rate per KG</p>
                <p className="text-sm font-bold text-gray-800">
                  ₹ {Number(service?.ratePerKg || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Chargeable Weight
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {Number(service?.chargeableWt || 0).toFixed(2)} KG
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Basic Amount
                </p>
                <p className="text-sm font-bold text-gray-800">
                  ₹ {Number(service?.basicAmt || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* GST Breakdown */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 font-medium mb-2">
                Tax Breakdown:
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {service?.igst > 0 ? (
                  <div className="bg-white rounded px-3 py-2">
                    <p className="text-xs text-gray-500">IGST (18%)</p>
                    <p className="font-semibold text-gray-700">
                      ₹ {Number(service?.igst || 0).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded px-3 py-2">
                      <p className="text-xs text-gray-500">SGST (9%)</p>
                      <p className="font-semibold text-gray-700">
                        ₹ {Number(service?.sgst || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white rounded px-3 py-2">
                      <p className="text-xs text-gray-500">CGST (9%)</p>
                      <p className="font-semibold text-gray-700">
                        ₹ {Number(service?.cgst || 0).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Calculation Formula */}
            <div className="mt-3 pt-3 flex justify-between items-center border-t">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Calculation:</span> ₹
                  {Number(service?.ratePerKg || 0).toFixed(2)} ×{" "}
                  {Number(service?.chargeableWt || 0).toFixed(2)} KG = ₹
                  {Number(service?.basicAmt || 0).toFixed(2)} + GST ₹
                  {(
                    Number(service?.sgst || 0) +
                    Number(service?.cgst || 0) +
                    Number(service?.igst || 0)
                  ).toFixed(2)}{" "}
                  =
                  <span className="font-bold text-[var(--primary-color)]">
                    {" "}
                    ₹{Number(service?.totalAmt || 0).toFixed(2)}
                  </span>
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="bg-[var(--primary-color)] text-white text-sm font-bold rounded-md px-12 py-1.5 hover:opacity-90"
                  onClick={() => {
                    setSelectedServiceLocal(service?.service);
                    router.push("/portal/createshipment");
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* No Results Message */}
      {!loading &&
        calculatedRates.length === 0 &&
        chargeableWeight !== "0.00" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-yellow-800 text-center font-medium">
              ⚠️ Fill in all required fields and click <strong>Calculate Rates</strong> to see
              pricing.
            </p>
          </div>
        )}
    </main>
  );
};

export default Page;
