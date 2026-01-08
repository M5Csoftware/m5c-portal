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

  useEffect(() => {
    if (!formData) return;
    Object.keys(formData).forEach((key) => setValue(key, formData[key]));
  }, [formData]);


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
      addressType: "Consignee", // 👈 important to differentiate
      // If KYC not required for receiver, backend should allow null/skip
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
      console.log("Failed to add address.");
    }
  };


  useEffect(() => {
    // Fetch receiver addresses from the API
    const fetchReceiverAddresses = async () => {
      try {
        const response = await axios.get(`${server}/portal/address-book/getAddress?accountCode=${session?.user?.accountCode}`);
        setReceiverAddresses(response.data);
      } catch (error) {
        console.error("Error fetching receiver addresses:", error);
      }
    };

    fetchReceiverAddresses();
  }, []);

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

  const addToAddBook = () => {
    if (saveToBook) {
      addAddress();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-10">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step <= 3 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/3.svg"
            alt="step 1"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step > 3 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/done-red.svg"
            alt="step 1"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold ">Receiver Details</h2>
      </div>
      <div
        className={`flex gap-2 items-start overflow-hidden transition-max-height duration-500 ease-in-out ${step === 3 ? "max-h-[700px]" : "max-h-0"
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
            <div className="flex w-full justify-end">
              {saveToBook ? (
                <div className="flex gap-2 items-center text-red-600" onClick={() => setSaveToBook(false)}>
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
                  {...register("receiverFullName", {
                    required: "Receiver name is required",
                  })}
                  placeholder="Full Name"
                  className="w-full border border-[#979797] block outline-none mb-2  rounded-md h-12 px-6 py-4"
                />
                {errors.receiverFullName && (
                  <span className="text-red-600">
                    {errors.receiverFullName.message}
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
                      Addresses={receiverAddresses}
                      selectedAdd={(address) => {
                        setValue("receiverAddress", address._id); // Set the selected address ID in the form
                        setAddressDropOpen(false); // Close the AddressPicker
                      }}
                      onClose={() => setAddressDropOpen(false)}
                      type={`receiver`}
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
                      message: "Invalid phone number",
                    },
                  })}
                  placeholder="Phone Number"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverPhoneNumber && (
                  <span className="text-red-600">
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
                      message: "Invalid email",
                    },
                  })}
                  placeholder="Email"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverEmail && (
                  <span className="text-red-600">
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
              className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
            />
            {errors.receiverAddressLine1 && (
              <span className="text-red-600 w-full">
                {errors.receiverAddressLine1.message}
              </span>
            )}
            <input
              {...register("receiverAddressLine2")}
              placeholder="Address Line 2 (optional)"
              className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
            />
            {errors.receiverAddressLine2 && (
              <span className="text-red-600">
                {errors.receiverAddressLine2.message}
              </span>
            )}
            <div className="flex gap-6 items-center w-full">
              <div className="w-full">
                <input
                  {...register("receiverCountry", {
                    required: "Country is required",
                  })}
                  placeholder="Country"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverCountry && (
                  <span className="text-red-600">
                    {errors.receiverCountry.message}
                  </span>
                )}
              </div>
              <div className="w-full">
                <input
                  {...register("receiverPincode", {
                    required: "Pincode is required",
                    pattern: {
                      value: /^[0-9]{4,10}$/,
                      message: "Invalid pincode",
                    },
                  })}
                  placeholder="Pincode"
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverPincode && (
                  <span className="text-red-600">
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
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverCity && (
                  <span className="text-red-600">
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
                  className="block  border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
                {errors.receiverState && (
                  <span className="text-red-600">
                    {errors.receiverState.message}
                  </span>
                )}
              </div>
            </div>

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
      </div>
    </div >
  );
};

export default ReceiverDetail;
