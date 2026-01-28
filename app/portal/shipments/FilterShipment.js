"use client";
import React, { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../GlobalContext.js";
import Image from "next/image";
import { useForm } from "react-hook-form";

function FilterShipment() {
  const paymentMethod = [
    {
      value: "credit",
      label: "Credit Card",
    },
    {
      value: "debit",
      label: "Debit Card",
    },
    {
      value: "paypal",
      label: "PayPal",
    },
    {
      value: "netbanking",
      label: "Net Banking",
    },
    {
      value: "upi",
      label: "UPI",
    },
    {
      value: "cash",
      label: "Cash on Delivery",
    },
  ];

  const service = [
    {
      value: "fedx",
      label: "Fedx",
    },
    {
      value: "cp",
      label: "Courier Please",
    },
  ];

  const country = [
    {
      value: "usa",
      label: "USA",
    },
    {
      value: "ind",
      label: "India",
    },
    {
      value: "uk",
      label: "UK",
    },
    {
      value: "canada",
      label: "Canada",
    },
    {
      value: "aus",
      label: "Australia",
    },
  ];

  const consignment = [
    {
      value: "consignee",
      label: "Consignee",
    },
    {
      value: "consigner",
      label: "Consigner",
    },
  ];

  const { filters, setFilters, filterShipmentWindow, setFilterShipmentWindow } =
    useContext(GlobalContext);

  // Local state for dropdown selections
  const [paymentFilter, setPaymentFilter] = useState(filters.paymentMethod);
  const [serviceFilter, setServiceFilter] = useState(filters.service);
  const [countryFilter, setCountryFilter] = useState(filters.country);
  const [consignmentFilter, setConsignmentFilter] = useState(
    filters.consignmentType,
  );

  // Local state for slider values
  const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 5000]);
  const [weightRange, setWeightRange] = useState(
    filters.weightRange || [0.5, 12.0],
  );

  // Initialize form with filter values
  const { register, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      filterType: filters.filterType || "All",
      m5Coin: filters.m5Coin || false,
      rto: filters.rto || false,
      inTransit: filters.inTransit || false,
      delivered: filters.delivered || false,
    },
  });

  const filterRadioButton = watch("filterType", "All");

  // Update local state when filters change
  useEffect(() => {
    setPaymentFilter(filters.paymentMethod);
    setServiceFilter(filters.service);
    setCountryFilter(filters.country);
    setConsignmentFilter(filters.consignmentType);
    setPriceRange(filters.priceRange || [0, 5000]);
    setWeightRange(filters.weightRange || [0.5, 12.0]);

    // Set form values
    setValue("filterType", filters.filterType || "All");
    setValue("m5Coin", filters.m5Coin || false);
    setValue("rto", filters.rto || false);
    setValue("inTransit", filters.inTransit || false);
    setValue("delivered", filters.delivered || false);
  }, [filters, setValue]);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleWeightChange = (event, newValue) => {
    setWeightRange(newValue);
  };

  const onSubmit = async (data) => {
    // Prepare the complete filters object
    const updatedFilters = {
      ...data,
      priceRange: priceRange,
      weightRange: weightRange,
      paymentMethod: paymentFilter,
      service: serviceFilter,
      country: countryFilter,
      consignmentType: consignmentFilter,
    };

    console.log("Applying filters:", updatedFilters);

    // Update global filters
    setFilters(updatedFilters);
    setFilterShipmentWindow(false);
  };

  const onReset = () => {
    // Reset form
    reset({
      filterType: "All",
      m5Coin: false,
      rto: false,
      inTransit: false,
      delivered: false,
    });

    // Reset local state
    setPaymentFilter(null);
    setServiceFilter(null);
    setCountryFilter(null);
    setConsignmentFilter(null);
    setPriceRange([0, 5000]);
    setWeightRange([0.5, 12.0]);

    // Reset global filters
    setFilters({
      filterType: "All",
      m5Coin: false,
      rto: false,
      inTransit: false,
      delivered: false,
      priceRange: [0, 5000],
      weightRange: [0.5, 12.0],
      paymentMethod: null,
      service: null,
      country: null,
      consignmentType: null,
    });
  };

  // Custom Dropdown Component
  const CustomDropdown = ({
    options,
    selectedOption,
    onSelect,
    title,
    name,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
      onSelect(option);
      setIsOpen(false);
    };

    return (
      <div className="relative w-full text-sm">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="border border-[#979797] rounded-[4px] text-[#979797] px-6 py-4 cursor-pointer"
        >
          {selectedOption ? selectedOption.label : `${title}`}
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full max-h-40 shadow-md overflow-y-auto bg-white rounded-[4px] mt-1">
            <div
              onClick={() => handleSelect(null)}
              className="px-6 py-4 hover:bg-gray-100 cursor-pointer text-[#979797]"
            >
              Clear selection
            </div>
            {options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                className="px-6 py-4 hover:bg-gray-100 cursor-pointer flex flex-col"
              >
                <span className="text-xs">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        className={`transition-all duration-500 ease-in-out ${filterShipmentWindow ? "max-w-[600px]" : "max-w-0 opacity-0"}`}
      >
        <div className="flex justify-between p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl text-[#18181B]">Filters</h2>
            <p className="text-sm text-[#979797]">
              Apply filters to refine shipment results
            </p>
          </div>
          <button
            className="flex hover:bg-gray-100 p-1 rounded"
            onClick={() => setFilterShipmentWindow(false)}
          >
            <Image
              src={`/customer-support/close-button.svg`}
              alt="close window"
              width={24}
              height={24}
            />
          </button>
        </div>

        <Image
          src={`/customer-support/window-line.svg`}
          alt="close window"
          width={600}
          height={0}
        />

        <div className="p-6">
          <form className="h-[80vh]" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="text-sm w-full flex flex-col gap-6">
                {/* Filter Type Radio Buttons */}
                <div className="flex gap-6">
                  <label
                    htmlFor="All"
                    className={`flex gap-4 rounded-md cursor-pointer ${filterRadioButton === "All" ? "text-[#EA1B40]" : "text-[#979797]"}`}
                  >
                    <input
                      type="radio"
                      {...register("filterType")}
                      value="All"
                      id="All"
                      className={
                        filterRadioButton === "All"
                          ? "accent-[#EA1B40]"
                          : "accent-[#979797]"
                      }
                    />
                    <div>All</div>
                  </label>
                  <label
                    htmlFor="Invoiced"
                    className={`flex gap-4 rounded-md cursor-pointer ${filterRadioButton === "Invoiced" ? "text-[#EA1B40]" : "text-[#979797]"}`}
                  >
                    <input
                      type="radio"
                      {...register("filterType")}
                      value="Invoiced"
                      id="Invoiced"
                      className={
                        filterRadioButton === "Invoiced"
                          ? "accent-[#EA1B40]"
                          : "accent-[#979797]"
                      }
                    />
                    <div>Invoiced</div>
                  </label>
                  <label
                    htmlFor="New"
                    className={`flex gap-4 rounded-md cursor-pointer ${filterRadioButton === "New" ? "text-[#EA1B40]" : "text-[#979797]"}`}
                  >
                    <input
                      type="radio"
                      {...register("filterType")}
                      value="New"
                      id="New"
                      className={
                        filterRadioButton === "New"
                          ? "accent-[#EA1B40]"
                          : "accent-[#979797]"
                      }
                    />
                    <div>New</div>
                  </label>
                </div>

                {/* Checkbox Filters */}
                <div className="flex flex-col gap-4">
                  <label
                    htmlFor="m5-coin"
                    className="flex gap-4 rounded-md w-fit text-[#979797] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      {...register("m5Coin")}
                      id="m5-coin"
                    />
                    <div>Shipment with M5 Coin Discount</div>
                  </label>
                  <label
                    htmlFor="rto"
                    className="flex gap-4 rounded-md w-fit text-[#979797] cursor-pointer"
                  >
                    <input type="checkbox" {...register("rto")} id="rto" />
                    <div>Applied for RTO</div>
                  </label>
                  <label
                    htmlFor="in-transit"
                    className="flex gap-4 rounded-md w-fit text-[#979797] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      {...register("inTransit")}
                      id="in-transit"
                    />
                    <div>In-Transit Shipments</div>
                  </label>
                  <label
                    htmlFor="delivered"
                    className="flex gap-4 rounded-md w-fit text-[#979797] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      {...register("delivered")}
                      id="delivered"
                    />
                    <div>Delivered Shipments</div>
                  </label>
                </div>

                {/* Sliders */}
                <div className="flex flex-col gap-8">
                  {/* Price Range Slider */}
                  <div className="space-y-4">
                    <div className="text-sm text-[#979797]">
                      Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[0]}
                      onChange={(e) =>
                        handlePriceChange(null, [
                          parseInt(e.target.value),
                          priceRange[1],
                        ])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) =>
                        handlePriceChange(null, [
                          priceRange[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-[#979797]">
                      <span>₹0</span>
                      <span>₹5000</span>
                    </div>
                  </div>

                  {/* Weight Range Slider */}
                  <div className="space-y-4">
                    <div className="text-sm text-[#979797]">
                      Chargeable Weight: {weightRange[0]}kg - {weightRange[1]}kg
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="12.0"
                      step="0.1"
                      value={weightRange[0]}
                      onChange={(e) =>
                        handleWeightChange(null, [
                          parseFloat(e.target.value),
                          weightRange[1],
                        ])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0.5"
                      max="12.0"
                      step="0.1"
                      value={weightRange[1]}
                      onChange={(e) =>
                        handleWeightChange(null, [
                          weightRange[0],
                          parseFloat(e.target.value),
                        ])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-[#979797]">
                      <span>0.5kg</span>
                      <span>12.0kg</span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-col gap-4">
                  <CustomDropdown
                    options={paymentMethod}
                    selectedOption={paymentFilter}
                    onSelect={setPaymentFilter}
                    title="Filter by Payment Method"
                    name="paymentFilter"
                  />
                  <CustomDropdown
                    options={service}
                    selectedOption={serviceFilter}
                    onSelect={setServiceFilter}
                    title="Filter by Forwarder or Service"
                    name="serviceFilter"
                  />
                  <CustomDropdown
                    options={country}
                    selectedOption={countryFilter}
                    onSelect={setCountryFilter}
                    title="Filter by Delivery Country"
                    name="countryFilter"
                  />
                  <CustomDropdown
                    options={consignment}
                    selectedOption={consignmentFilter}
                    onSelect={setConsignmentFilter}
                    title="Filter by Consignee/Consignor"
                    name="consignmentFilter"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full text-white text-sm rounded-md px-12 py-[14px] transition-all duration-500 bg-[var(--primary-color)] hover:bg-red-600 font-semibold"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="w-full text-[#979797] text-sm rounded-md px-12 py-[14px] border border-[#979797] hover:bg-gray-50 transition-all duration-500 font-semibold"
                >
                  Reset All
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FilterShipment;
