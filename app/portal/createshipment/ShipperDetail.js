import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Image from "next/image";
import AddressPicker from "../component/Address Book/AddressPicker";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";
import RedCheckbox from "@/app/components/RedCheckbox";
import KycUploadModal from "../address-book/KycUploadModal";
import { useFormData } from "./FormDataContext";


const ShipperDetail = ({
  register,
  errors,
  onNext,
  watch,
  setValue,
  getValue,
  step,
  onPrev,
  getValues,
  trigger,
}) => {
  const [shipperAddresses, setShipperAddresses] = useState([]);
  const [addressDropOpen, setAddressDropOpen] = useState(false);
  const [saveToBook, setSaveToBook] = useState(false);
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycUploaded, setKycUploaded] = useState(false);

  const { formData } = useFormData();

  useEffect(() => {
    if (!formData) return;

    Object.keys(formData).forEach((key) => {
      setValue(key, formData[key]);
    });
  }, [formData]);

  const handleNext = async () => {
    const isValid = await trigger([
      "shipperFullName",
      "shipperPhoneNumber",
      "shipperEmail",
      "shipperAddressLine1",
      "shipperCountry",
      "shipperCity",
      "shipperState",
      "shipperPincode",
      "shipperKycType",
      "shipperKycNumber",
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
      addressType: "Consignor",

      // Person Details
      fullName: values.shipperFullName,
      phoneNumber: values.shipperPhoneNumber,
      email: values.shipperEmail,

      // Address Details
      addressLine1: values.shipperAddressLine1,
      addressLine2: values.shipperAddressLine2,
      city: values.shipperCity,
      state: values.shipperState,
      country: values.shipperCountry,
      pincode: values.shipperPincode,

      // KYC Fields
      kycType: values.shipperKycType,
      kycNumber: values.shipperKycNumber,
      kycFrontUrl: values.shipperKycFrontUrl,   // ✔ ADD THIS
      kycBackUrl: values.shipperKycBackUrl,     // ✔ ADD THIS
    };


    console.log(payload)

    try {
      const response = await axios.post(
        `${server}/portal/address-book`,
        payload
      );

      setShipperAddresses((prev) => [...prev, response.data]);
      alert("Shipper address added successfully!");
    } catch (error) {
      console.error("Error adding shipper address:", error);
      console.log("Failed to add address.");
    }
  };


  useEffect(() => {
    // Fetch shipper addresses from the API
    const fetchShipperAddresses = async () => {
      try {
        const response = await axios.get(`${server}/portal/address-book/getAddress?accountCode=${session?.user?.accountCode}`);
        setShipperAddresses(response.data);
      } catch (error) {
        console.error("Error fetching shipper addresses:", error);
      }
    };

    fetchShipperAddresses();
  }, []);

  // Watch the selected address and update form fields accordingly
  const selectedAddressId = watch("shipperAddress");
  useEffect(() => {
    if (selectedAddressId) {
      const selectedAddress = shipperAddresses.find(
        (address) => address._id === selectedAddressId
      );
      if (selectedAddress) {
        setValue("shipperFullName", selectedAddress.fullName);
        setValue("shipperAddressLine1", selectedAddress.addressLine1);
        setValue("shipperAddressLine2", selectedAddress.addressLine2);
        setValue("shipperCity", selectedAddress.city);
        setValue("shipperState", selectedAddress.state);
        setValue("shipperCountry", selectedAddress.country);
        setValue("shipperPincode", selectedAddress.pincode);
        setValue("shipperPhoneNumber", selectedAddress.phoneNumber);
        setValue("shipperEmail", selectedAddress.email);
        setValue("shipperKycType", selectedAddress.kycType);
        setValue("shipperKycNumber", selectedAddress.kycNumber);
      }
    }
  }, [selectedAddressId, shipperAddresses, setValue]);

  const addToAddBook = () => {
    if (saveToBook) {
      addAddress();
    }
  };


  return (
    <div className="bg-white rounded-3xl p-10">
      <div className="flex gap-2  items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step <= 2 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/2.svg"
            alt="step 2"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step > 2 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/done-red.svg"
            alt="step 2"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold ">Shipper Details</h2>
      </div>
      <div
        className={`flex gap-2 items-start overflow-hidden transition-max-height duration-500 ease-in-out ${step === 2 ? "max-h-[700px]" : "max-h-0"
          }`}
      >
        <Image
          className="py-6"
          src="/create-shipment/shipper.svg"
          alt="step 1"
          width={36}
          height={36}
        />
        <div className="w-full text-xs" >
          <div className="py-2 px-2 gap-4 flex flex-col items-center">

            <div className="flex w-full justify-end"> {saveToBook ? (
              <div className="flex gap-2 items-center text-red-600" onClick={() => { setSaveToBook(false); }}>
                <Image src={`/create-shipment/done-red.svg`} alt='check' width={15} height={15} />
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
            )
            }
            </div>

            <div className="items-center w-full flex justify-between gap-6">
              <div className="w-1/2 items-center">
                <input
                  {...register("shipperFullName", {
                    required: "Shipper name is required",
                  })}
                  placeholder="Full Name"
                  className="w-full border border-[#979797] block outline-none mb-2  rounded-md h-12 px-6 py-4"
                />
                {errors.shipperFullName && (
                  <span className="text-red-600">
                    {errors.shipperFullName.message}
                  </span>
                )}
              </div>
              <div className={`w-1/2 items-center cursor-pointer relative ${errors.shipperFullName && "pb-4"}`}>
                <div
                  onClick={() => {
                    setAddressDropOpen(!addressDropOpen);
                  }}
                  className="bg-[var(--primary-color)] flex gap-2   font-bold text-white h-12 px-6 py-4 mb-2 rounded-md items-center justify-center"
                >
                  <div className="bg-white rounded-lg size-6 flex justify-center items-center">
                    <Image
                      src={"/create-shipment/select-address.svg"}
                      alt=""
                      width={15}
                      height={14}
                    />
                  </div>
                  <span>Select from Address Book</span>
                </div>
                {addressDropOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <AddressPicker
                      Addresses={shipperAddresses}
                      selectedAdd={(address) => {
                        setValue("shipperAddress", address._id); // Set the selected address ID in the form
                        setAddressDropOpen(false); // Close the AddressPicker
                      }}
                      onClose={() => setAddressDropOpen(false)}
                      type={`shipper`}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex w-full gap-6">
              <div className="w-full">
                <input
                  {...register("shipperPhoneNumber", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{8,15}$/,
                      message: "Invalid phone number",
                    },
                  })}
                  placeholder="Phone Number"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.shipperPhoneNumber && (
                  <span className="text-red-600">
                    {errors.shipperPhoneNumber.message}
                  </span>
                )}
              </div>

              <div className="w-full">
                <input
                  {...register("shipperEmail", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email",
                    },
                  })}
                  placeholder="Email"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.shipperEmail && (
                  <span className="text-red-600">
                    {errors.shipperEmail.message}
                  </span>
                )}
              </div>
            </div>
            <input
              {...register("shipperAddressLine1", {
                required: "Address is required",
              })}
              placeholder="Address Line 1"
              className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
            />
            {errors.shipperAddressLine1 && (
              <span className="text-red-600 w-full">
                {errors.shipperAddressLine1.message}
              </span>
            )}
            <input
              {...register("shipperAddressLine2")}
              placeholder="Address Line 2 (optional)"
              className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
            />
            {errors.shipperAddressLine2 && (
              <span className="text-red-600">
                {errors.shipperAddressLine2.message}
              </span>
            )}
            <div className="flex gap-6 items-center w-full">
              <div className="w-full">

                <input
                  {...register("shipperCountry", { required: "Country is required" })}
                  placeholder="Country"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.shipperCountry && (
                  <span className="text-red-600">
                    {errors.shipperCountry.message}
                  </span>
                )}
              </div>

              <div className="w-full">

                <input
                  {...register("shipperPincode", {
                    required: "Pincode is required",
                    pattern: { value: /^[0-9]{4,10}$/, message: "Invalid pincode" }
                  })}
                  placeholder="Pincode"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.shipperPincode && (
                  <span className="text-red-600">
                    {errors.shipperPincode.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-6 items-center w-full">
              <div className="w-full">
                <input
                  {...register("shipperCity", { required: "City is required" })}
                  placeholder="City"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.shipperCity && (
                  <span className="text-red-600">
                    {errors.shipperCity.message}
                  </span>
                )}
              </div>
              <div className="w-full">
                <input
                  {...register("shipperState", { required: "State is required" })}
                  placeholder="State"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.shipperState && (
                  <span className="text-red-600">
                    {errors.shipperState.message}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full flex items-center gap-6">
              <div className="w-full flex gap-2">
                {/* Select KYC Type */}
                <div className="w-full">
                  <select
                    {...register("shipperKycType", {
                      required: "KYC type is required",
                    })}
                    className="block mb-2 outline-none border-[#979797] border rounded-md h-12 px-6 py-4 w-full"
                  >
                    <option value="">Select KYC Type</option>
                    <option value="Aadhaar">GSTIN (Normal)</option>
                    <option value="Aadhaar">GSTIN (Govt Entities)</option>
                    <option value="Aadhaar">GSTIN (Diplomats)</option>
                    <option value="Aadhaar">Aadhaar Number</option>
                    <option value="PAN">PAN Number</option>
                    <option value="Passport">TAN Number</option>
                    <option value="Passport">Passport Number</option>
                    <option value="Driving License">Voter Id</option>
                  </select>
                </div>

                {/* KYC Number */}
                <div className="w-full">
                  <input
                    {...register("shipperKycNumber", {
                      required: "KYC number is required",
                    })}
                    placeholder="KYC Number"
                    className="block border border-[#979797] outline-none mb-2 rounded-md h-12 px-6 py-4 w-full"
                  />
                  {errors.shipperKycNumber && (
                    <span className="text-red-600">{errors.shipperKycNumber.message}</span>
                  )}
                </div>
              </div>
              {/* Hidden URLs */}
              <input type="hidden" {...register("shipperKycFrontUrl")} />
              <input type="hidden" {...register("shipperKycBackUrl")} />

              {/* Upload KYC Photo Button */}
              <button
                type="button"
                onClick={() => setShowKycModal(true)}
                className="cursor-pointer border border-[var(--primary-color)] text-[var(--primary-color)]
               rounded-md h-12 w-full font-bold flex items-center justify-center gap-2 mb-2"
              >
                <div className="rounded-lg shadow-sm p-1">
                  <Image
                    src={`/create-shipment/upload-kyc.svg`}
                    alt="Upload Icon"
                    width={13}
                    height={14}
                  />
                </div>
                <span>{kycUploaded ? "Uploaded" : "Upload KYC Photo"}</span>
              </button>
            </div>

            {/* KYC MODAL */}
            {showKycModal && (
              <KycUploadModal
                accountCode={session?.user?.accountCode}
                onClose={() => setShowKycModal(false)}
                onUploaded={({ kycFrontUrl, kycBackUrl }) => {
                  setValue("shipperKycFrontUrl", kycFrontUrl);
                  setValue("shipperKycBackUrl", kycBackUrl);
                  setKycUploaded(true);
                }}
              />
            )}

          </div>
          <div className="flex justify-end">
            <div className="flex gap-4">
              <button
                className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-3"
                type="button"
                onClick={onPrev}
              >
                Back
              </button>
              <button
                className="bg-[var(--primary-color)] text-white font-semibold rounded-md px-12 py-3"
                type="button"
                onClick={handleNext}
              >
                Next
              </button>

            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default ShipperDetail;
