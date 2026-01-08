"use client";

import { useState, useContext, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../../GlobalContext";
import NotificationFlag from "../../component/NotificationFlag";

const ViewInvoicing = () => {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    subMessage: "",
  });

  const [formData, setFormData] = useState({
    contactNumber: "",
    completeAddress: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    fetchInvoicingData();
  }, [session]);

  const fetchInvoicingData = async () => {
    try {
      const accountCode = session?.user?.accountCode;
      if (!accountCode) return;

      const response = await axios.get(
        `${server}/portal/setting-billing?accountCode=${accountCode}&type=viewInvoicing`
      );

      if (response.data.success && response.data.data.length > 0) {
        const latestData = response.data.data[response.data.data.length - 1];
        setFormData({
          contactNumber: latestData.contactNumber || "",
          completeAddress: latestData.completeAddress || "",
          landmark: latestData.landmark || "",
          pincode: latestData.pincode || "",
          city: latestData.city || "",
          state: latestData.state || "",
        });
      }
    } catch (error) {
      console.error("Error fetching invoicing data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accountCode = session?.user?.accountCode;
    if (!accountCode) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${server}/portal/setting-billing`, {
        accountCode,
        type: "viewInvoicing",
        data: formData,
      });

      setNotification({
        visible: true,
        message: "Billing Address Saved",
        subMessage: "Your billing address has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save billing address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 bg-[#FFFFFF] rounded-lg p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Billing Address</h2>
            <p className="text-xs text-[#71717A]">
              Billing address is the same as your company pick-up address
              entered during onboarding.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-5">
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold">
                  Contact Number
                </label>
                <input
                  name="contactNumber"
                  type="text"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md h-12 px-4 text-sm w-[320px] outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold">
                  Complete Address
                </label>
                <input
                  name="completeAddress"
                  type="text"
                  value={formData.completeAddress}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md h-12 px-4 text-sm w-[320px] outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold">
                  Address Landmark{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  name="landmark"
                  type="text"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md h-12 px-4 text-sm w-[320px] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold">Pincode</label>
                <input
                  name="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md h-12 px-4 text-sm w-[320px] outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold">City</label>
                <input
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md h-12 px-4 text-sm w-[320px] outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold">State</label>
                <input
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md h-12 px-4 text-sm w-[320px] outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button Row */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 w-[10vw] text-white rounded-md px-5 py-2.5 hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </form>

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

export default ViewInvoicing;