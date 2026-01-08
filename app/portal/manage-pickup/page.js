"use client";
import axios from "axios";
import Image from "next/image";
import React, { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

const PickupAddress = () => {
  const [showModal, setShowModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const { data: session } = useSession();
  const { server } = useContext(GlobalContext);
  const accountCode = session?.user?.accountCode;

  const [formData, setFormData] = useState({
    name: "",
    addressName: "",
    contact: "",
    street: "",
    locality: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  });

  // Fetch addresses from the backend when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(
          `${server}/portal/manage-pickup/getAddress?accountCode=${accountCode}`
        );
        setAddresses(response.data.data || response.data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (formData.name && formData.addressName && formData.contact) {
      try {
        let response;
        const payload = { ...formData, accountCode }; // always include accountCode
        console.log(payload)

        if (editingId) {
          response = await axios.put(
            `${server}/portal/manage-pickup?id=${editingId}`,
            payload
          );
        } else {
          response = await axios.post(
            `${server}/portal/manage-pickup`,
            payload
          );
        }

        const newAddress = response.data.data;

        if (response.status === 201 || response.status === 200) {
          if (editingId) {
            setAddresses(
              addresses.map((addr) =>
                addr._id === editingId ? newAddress : addr
              )
            );
          } else {
            setAddresses([...addresses, newAddress]);
          }

          setShowModal(false);
          setFormData({
            name: "",
            addressName: "",
            contact: "",
            street: "",
            locality: "",
            landmark: "",
            pincode: "",
            city: "",
            state: "",
          });
          setEditingId(null);
        }
      } catch (error) {
        console.error("Error saving address:", error);
      }
    }
  };


  const handleEdit = (address) => {
    setEditingId(address._id); // Store ID to detect PUT
    setFormData({ ...address }); // Prefill the form
    setShowModal(true); // Show modal
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${server}/portal/manage-pickup?id=${id}`
      );
      if (response.status === 200) {
        setAddresses(addresses.filter((a) => a._id !== id));
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="px-6 font-bold text-2xl">Pickup Address</h1>
      </div>

      <div className="flex justify-between px-6 items-center">
        <div>
          <h3 className="font-bold text-[10px] text-[#A0AEC0]">
            {addresses.length} contact(s) in total
          </h3>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-md">
          {/* Search Input */}
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <span className="text-gray-500">
              <Image width={20} height={20} src="/search.svg" alt="Search" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="ml-2 bg-transparent outline-none text-gray-700"
            />
          </div>

          {/* Delete Button */}
          <button
            onClick={async () => {
              try {
                // Use Promise.all to send delete requests in parallel
                await Promise.all(
                  selectedIds.map((id) =>
                    axios.delete(
                      `${server}/portal/manage-pickup?id=${id}`
                    )
                  )
                );
                // Remove from local state
                setAddresses((prev) =>
                  prev.filter((a) => !selectedIds.includes(a._id))
                );
                setSelectedIds([]); // clear selection
              } catch (error) {
                console.error("Error deleting selected addresses:", error);
              }
            }}
            disabled={selectedIds.length === 0}
            className={`flex items-center gap-1 border rounded-md px-4 py-2 text-[#EA1B40] border-[#EA1B40] hover:bg-red-100 ${selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            <span>
              <Image
                width={15}
                height={18}
                src="/red-delete.svg"
                alt="Delete"
              />
            </span>
            Delete ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="p-6 ">
        {/* Add Address Button */}
        <div className="flex gap-4">
          {/* Address Cards */}
          <div className=" grid grid-cols-5 gap-2 ">
            <div
              className="w-[280px] h-[190px] rounded-md border border-[#E2E8F0] py-4 px-5 flex justify-center items-center cursor-pointer"
              onClick={() => {
                setShowModal(true);
                setFormData({
                  name: "",
                  addressName: "",
                  contact: "",
                  street: "",
                  locality: "",
                  landmark: "",
                  pincode: "",
                  city: "",
                  state: "",
                });
              }}
            >
              <Image width={72} height={72} src="/plus-red.svg" alt="Wallet" />
            </div>

            {addresses.length > 0 ? (
              addresses.map((address, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-5 w-[280px] h-[190px] bg-white flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#EA1B40] flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(address._id)}
                        onChange={(e) => {
                          const { checked } = e.target;
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, address._id]
                              : prev.filter((id) => id !== address._id)
                          );
                        }}
                        className="w-[18px] h-[18px] rounded-sm border-2 border-[#EA1B40] text-[#EA1B40] focus:ring-red-500 accent-red-500 cursor-pointer"
                      />
                      Office #{index + 1}
                    </h3>

                    <span className="text-xs bg-red-100 text-[#EA1B40] px-2 py-1 rounded-md border border-[#EA1B40]">
                      {address.locality}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-gray-700">
                    <p className="line-clamp-1">
                      {address.street}, {address.city}, {address.state} -{" "}
                      {address.pincode}
                    </p>
                    <div className="flex items-center gap-1">
                      <Image
                        width={17}
                        height={17}
                        src="/call-chat.svg"
                        alt="Call"
                      />
                      <p>{address.contact}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Image
                        width={17}
                        height={17}
                        src="/location.svg"
                        alt="Location"
                      />
                      <p>{address.landmark || "No Landmark"}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEdit(address)}
                      className="border border-[#EA1B40] font-semibold text-[11px] text-[#EA1B40] px-1 py-0.5 w-[76px] h-[25px] rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="border border-[#EA1B40] font-semibold text-[11px] text-[#EA1B40] px-1 py-0.5 w-[76px] h-[25px] rounded-md"
                    >
                      Delete
                    </button>
                    <button className="border border-[#EA1B40] font-semibold text-[11px] text-[#EA1B40] px-1 py-0.5 w-[76px] h-[25px] rounded-md">
                      Share
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 flex mt-4 justify-center items-center">
                No addresses found.
              </div>
            )}
          </div>
        </div>

        {/* Modal (Popup) */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[900px]">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Pickup Address</h2>
                <button
                  className="text-[#EA1B40] text-xl"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Save Address As"
                  className="border p-2 w-full rounded-md"
                />
                <input
                  type="text"
                  name="addressName"
                  value={formData.addressName}
                  onChange={handleChange}
                  placeholder="Set address name"
                  className="border p-2 w-full rounded-md"
                />
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Contact Person's Number"
                  className="border p-2 w-full rounded-md"
                />
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Building / Floor / Street - Address Line"
                  className="border p-2 w-full rounded-md"
                />
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="Area / Sector / Locality"
                  className="border p-2 w-full rounded-md"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Nearby Landmark (Optional)"
                    className="border p-2 w-1/2 rounded-md"
                  />
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    className="border p-2 w-1/2 rounded-md"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="border p-2 w-1/2 rounded-md"
                  />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="border p-2 w-1/2 rounded-md"
                  >
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between mt-4">
                <button
                  className="border border-[#EA1B40] text-[#EA1B40] px-4 py-2 rounded-md"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  className="bg-[#EA1B40] text-white px-4 py-2 rounded-md"
                  onClick={handleSave}
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupAddress;
