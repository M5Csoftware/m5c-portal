import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Image from "next/image";
import AddressPicker from "../component/Address Book/AddressPicker";
import { useSession } from "next-auth/react";
import { GlobalContext } from "../GlobalContext";
import RedCheckbox from "@/app/components/RedCheckbox";
import { useFormData } from "./FormDataContext";

const ReceiverDetail = ({
  register,
  errors,
  onNext,
  onPrev,
  watch,
  setValue,
  getValues,
  step,
  trigger,
}) => {
  const [receiverAddresses, setReceiverAddresses] = useState([]);
  const [addressDropOpen, setAddressDropOpen] = useState(false);
  const [saveToBook, setSaveToBook] = useState(false);
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();

  const { formData } = useFormData();

  // Watch sector to determine postal code validation
  const selectedSector = watch("sector");
  const receiverCountry = watch("receiverCountry");

  useEffect(() => {
    if (!formData) return;
    Object.keys(formData).forEach((key) => setValue(key, formData[key]));
  }, [formData, setValue]);

  const handleNext = async () => {
    const isValid = await trigger([
      "receiverFullName",
      "receiverPhoneNumber",
      "receiverEmail",
      "receiverAddressLine1",
      "receiverCountry",
      "receiverCity",
      "receiverState",
      "receiverPincode",
    ]);

    if (!isValid) return;

    if (saveToBook) {
      await addAddress();
    }

    onNext();
  };

  const addAddress = async () => {
    const values = getValues();

    const payload = {
      accountCode: session?.user?.accountCode,
      fullName: values.receiverFullName,
      phoneNumber: values.receiverPhoneNumber,
      email: values.receiverEmail,
      addressLine1: values.receiverAddressLine1,
      addressLine2: values.receiverAddressLine2,
      city: values.receiverCity,
      state: values.receiverState,
      country: values.receiverCountry,
      pincode: values.receiverPincode,
      addressType: "Consignee",
      kycType: values.receiverKycType || "N/A",
      kycNumber: values.receiverKycNumber || "N/A",
    };

    try {
      const response = await axios.post(
        `${server}/portal/address-book`,
        payload
      );

      setReceiverAddresses((prev) => [...prev, response.data.data]);
      alert("Receiver address added successfully!");
    } catch (error) {
      console.error("Error saving receiver address:", error);
      alert("Failed to add address.");
    }
  };

  useEffect(() => {
    const fetchReceiverAddresses = async () => {
      try {
        const response = await axios.get(
          `${server}/portal/address-book/getAddress?accountCode=${session?.user?.accountCode}`
        );
        setReceiverAddresses(response.data);
      } catch (error) {
        console.error("Error fetching receiver addresses:", error);
      }
    };

    fetchReceiverAddresses();
  }, [server, session?.user?.accountCode]);

  // Watch the selected address and update form fields accordingly
  const selectedAddressId = watch("receiverAddress");
  useEffect(() => {
    if (selectedAddressId) {
      const selectedAddress = receiverAddresses.find(
        (address) => address._id === selectedAddressId
      );
      if (selectedAddress) {
        setValue("receiverFullName", selectedAddress.fullName);
        setValue("receiverAddressLine1", selectedAddress.addressLine1);
        setValue("receiverAddressLine2", selectedAddress.addressLine2);
        setValue("receiverCity", selectedAddress.city);
        setValue("receiverState", selectedAddress.state);
        setValue("receiverCountry", selectedAddress.country);
        setValue("receiverPincode", selectedAddress.pincode);
        setValue("receiverPhoneNumber", selectedAddress.phoneNumber);
        setValue("receiverEmail", selectedAddress.email);
      }
    }
  }, [selectedAddressId, receiverAddresses, setValue]);

  // ✅ FIXED: Dynamic postal code validation based on sector/country
  const getPincodeValidation = () => {
    const isCanada =
      selectedSector?.toLowerCase().includes("ca") ||
      receiverCountry?.toLowerCase().includes("canada");

    const isAustralia =
      selectedSector?.toLowerCase().includes("aus") ||
      receiverCountry?.toLowerCase().includes("australia");

    return {
      required: "Postal/Zip code is required",
      validate: (value) => {
        if (!value) return "Postal/Zip code is required";

        // Canada: A1A 1A1 format (with or without space)
        if (isCanada) {
          const canadaPattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
          if (!canadaPattern.test(value)) {
            return "Invalid Canadian postal code format (e.g., M5V 2T6 or M5V2T6)";
          }
        }

        // Australia: 4 digits
        if (isAustralia) {
          const australiaPattern = /^\d{4}$/;
          if (!australiaPattern.test(value.replace(/\s/g, ""))) {
            return "Invalid Australian postcode format (e.g., 2000)";
          }
        }

        // Other countries: 4-10 digits
        if (!isCanada && !isAustralia) {
          const generalPattern = /^[0-9]{4,10}$/;
          if (!generalPattern.test(value)) {
            return "Invalid postal/zip code (4-10 digits)";
          }
        }

        return true;
      },
    };
  };

  // ✅ Get placeholder text based on country/sector
  const getPincodePlaceholder = () => {
    const isCanada =
      selectedSector?.toLowerCase().includes("ca") ||
      receiverCountry?.toLowerCase().includes("canada");

    const isAustralia =
      selectedSector?.toLowerCase().includes("aus") ||
      receiverCountry?.toLowerCase().includes("australia");

    if (isCanada) return "Postal Code (e.g., M5V 2T6)";
    if (isAustralia) return "Postcode (e.g., 2000)";
    return "Postal/Zip Code";
  };

  return (
    <div className="bg-white rounded-3xl p-10">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step <= 3 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/3.svg"
            alt="step 3"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step > 3 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/done-red.svg"
            alt="step 3 completed"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold">Receiver Details</h2>
      </div>
      <div
        className={`flex gap-2 items-start overflow-hidden transition-max-height duration-500 ease-in-out ${
          step === 3 ? "max-h-[700px]" : "max-h-0"
        }`}
      >
        <Image
          className="py-6"
          src="/create-shipment/shipper.svg"
          alt="icon"
          width={36}
          height={36}
        />
        <div className="w-full text-xs">
          <div className="py-2 px-2 gap-4 flex flex-col items-center">
            <div className="flex w-full justify-end">
              {saveToBook ? (
                <div
                  className="flex gap-2 items-center text-red-600 cursor-pointer"
                  onClick={() => setSaveToBook(false)}
                >
                  <Image
                    src="/create-shipment/done-red.svg"
                    alt="check"
                    width={15}
                    height={15}
                  />
                  <p className="text-xs font-semibold">Saved to Address Book</p>
                </div>
              ) : (
                <RedCheckbox
                  id="saveToBook"
                  register={register}
                  setValue={setValue}
                  isChecked={saveToBook}
                  setChecked={setSaveToBook}
                  label="Add to Address Book"
                />
              )}
            </div>

            <div className="items-center w-full flex justify-between gap-6">
              <div className="w-1/2 items-center">
                <input
                  {...register("receiverFullName", {
                    required: "Receiver name is required",
                  })}
                  placeholder="Full Name"
                  className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
                />
                {errors.receiverFullName && (
                  <span className="text-red-600 text-xs">
                    {errors.receiverFullName.message}
                  </span>
                )}
              </div>
              <div
                className={`w-1/2 items-center cursor-pointer relative ${
                  errors.receiverFullName && "pb-4"
                }`}
              >
                <div
                  onClick={() => {
                    setAddressDropOpen(!addressDropOpen);
                  }}
                  className="bg-[var(--primary-color)] flex gap-2 font-bold text-white h-12 px-6 py-4 mb-2 rounded-md items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <div className="bg-white rounded-lg size-6 flex justify-center items-center">
                    <Image
                      src="/create-shipment/select-address.svg"
                      alt="address icon"
                      width={15}
                      height={14}
                    />
                  </div>
                  <span>Select from Address Book</span>
                </div>
                {addressDropOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <AddressPicker
                      Addresses={receiverAddresses}
                      selectedAdd={(address) => {
                        setValue("receiverAddress", address._id);
                        setAddressDropOpen(false);
                      }}
                      onClose={() => setAddressDropOpen(false)}
                      type="receiver"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full gap-6">
              <div className="w-full">
                <input
                  {...register("receiverPhoneNumber", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{8,15}$/,
                      message: "Invalid phone number (8-15 digits)",
                    },
                  })}
                  placeholder="Phone Number"
                  className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverPhoneNumber && (
                  <span className="text-red-600 text-xs">
                    {errors.receiverPhoneNumber.message}
                  </span>
                )}
              </div>
              <div className="w-full">
                <input
                  {...register("receiverEmail", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email format",
                    },
                  })}
                  placeholder="Email"
                  className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverEmail && (
                  <span className="text-red-600 text-xs">
                    {errors.receiverEmail.message}
                  </span>
                )}
              </div>
            </div>

            <input
              {...register("receiverAddressLine1", {
                required: "Address is required",
              })}
              placeholder="Address Line 1"
              className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
            />
            {errors.receiverAddressLine1 && (
              <span className="text-red-600 text-xs w-full">
                {errors.receiverAddressLine1.message}
              </span>
            )}

            <input
              {...register("receiverAddressLine2")}
              placeholder="Address Line 2 (optional)"
              className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
            />

            <div className="flex gap-6 items-center w-full">
              <div className="w-full">
                <input
                  {...register("receiverCountry", {
                    required: "Country is required",
                  })}
                  placeholder="Country"
                  className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverCountry && (
                  <span className="text-red-600 text-xs">
                    {errors.receiverCountry.message}
                  </span>
                )}
              </div>
              <div className="w-full">
                {/* ✅ FIXED: Dynamic postal code validation */}
                <input
                  {...register("receiverPincode", getPincodeValidation())}
                  placeholder={getPincodePlaceholder()}
                  className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverPincode && (
                  <span className="text-red-600 text-xs">
                    {errors.receiverPincode.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-6 items-center w-full">
              <div className="w-full">
                <input
                  {...register("receiverCity", {
                    required: "City is required",
                  })}
                  placeholder="City"
                  className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverCity && (
                  <span className="text-red-600 text-xs">
                    {errors.receiverCity.message}
                  </span>
                )}
              </div>
              <div className="w-full">
                <input
                  {...register("receiverState", {
                    required: "State is required",
                  })}
                  placeholder="State"
                  className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverState && (
                  <span className="text-red-600 text-xs">
                    {errors.receiverState.message}
                  </span>
                )}
              </div>
            </div>

            {/* ✅ Show helpful hint for Canada/Australia */}
            {(selectedSector?.toLowerCase().includes("ca") ||
              receiverCountry?.toLowerCase().includes("canada")) && (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800">
                <p className="font-semibold">Canadian Postal Code Format:</p>
                <p>Must be in format A1A 1A1 (e.g., M5V 2T6 or M5V2T6)</p>
              </div>
            )}

            {(selectedSector?.toLowerCase().includes("aus") ||
              receiverCountry?.toLowerCase().includes("australia")) && (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800">
                <p className="font-semibold">Australian Postcode Format:</p>
                <p>Must be 4 digits (e.g., 2000, 3000, 4000)</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <div className="flex gap-4">
              <button
                className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-3 hover:bg-red-50 transition-colors"
                type="button"
                onClick={onPrev}
              >
                Back
              </button>
              <button
                className="bg-[var(--primary-color)] text-white font-semibold rounded-md px-12 py-3 hover:bg-red-700 transition-colors"
                type="button"
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

export default ReceiverDetail;