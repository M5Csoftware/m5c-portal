"use client";
import React, { useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import ShipmentNotifications from "./ShipmentNotifications";
import BillingandPaymentNotifications from "./BillingandPaymentNotifications";
import OffersAndUpdatesNotification from "./OffersAndUpdatesNotification";
import NotificationFlag from "../component/NotificationFlag";
import { GlobalContext } from "../GlobalContext";

const Page = () => {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  
  const [notifications, setNotifications] = useState({
    // Shipment Notifications
    shipmentCreated_email: false,
    shipmentDelayed_email: false,
    shipmentStatus_email: false,
    manifestCreated_email: false,
    shipmentHold_email: false,
    shipmentCreated_portal: false,
    shipmentDelayed_portal: false,
    shipmentStatus_portal: false,
    manifestCreated_portal: false,
    shipmentHold_portal: false,

    // Billing and Payment Notifications
    newInvoiceGenerated_email: false,
    paymentDueReminder_email: false,
    creditLimitExceededAlert_email: false,
    creditLimitExceededAlert2_email: false,
    billingError_email: false,
    rateHike_email: false,
    newInvoiceGenerated_portal: false,
    paymentDueReminder_portal: false,
    creditLimitExceededAlert_portal: false,
    creditLimitExceededAlert2_portal: false,
    billingError_portal: false,
    rateHike_portal: false,

    // Offers and Updates Notifications
    NewFeatureAnnouncement_email: false,
    LimiteTimeOffersDiscounts_email: false,
    PortalMaintenanceAlert_email: false,
    NewsletterMonthlyDigest_email: false,
    ServiceUpdates_email: false,
    NewFeatureAnnouncement_portal: false,
    LimiteTimeOffersDiscounts_portal: false,
    PortalMaintenanceAlert_portal: false,
    NewsletterMonthlyDigest_portal: false,
    ServiceUpdates_portal: false,
  });

  const [originalNotifications, setOriginalNotifications] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    subMessage: "",
  });

  // Fetch existing preferences on mount
  useEffect(() => {
    fetchNotificationPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(notifications) !== JSON.stringify(originalNotifications);
    setHasChanges(changed);
  }, [notifications, originalNotifications]);

  const fetchNotificationPreferences = async () => {
    try {
      const accountCode = session?.user?.accountCode;
      if (!accountCode) return;

      setFetching(true);
      const response = await axios.get(
        `${server}/portal/setting-shipment-notif?accountCode=${accountCode}`
      );

      if (response.data.success && response.data.data) {
        const fetchedData = response.data.data;
        setNotifications((prev) => ({ ...prev, ...fetchedData }));
        setOriginalNotifications({ ...notifications, ...fetchedData });
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleNotificationChange = (id, checked) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSave = async () => {
    const accountCode = session?.user?.accountCode;
    if (!accountCode) {
      setNotification({
        visible: true,
        message: "Session Expired",
        subMessage: "Please login again.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${server}/portal/setting-shipment-notif`,
        {
          accountCode,
          notifications,
        }
      );

      if (response.data.success) {
        setOriginalNotifications({ ...notifications });
        setNotification({
          visible: true,
          message: hasChanges ? "Settings Updated" : "Settings Saved",
          subMessage: "Your notification preferences have been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      setNotification({
        visible: true,
        message: "Save Failed",
        subMessage: "Failed to save notification preferences. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA1B40] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-4 rounded-lg shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Notification Settings
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your notification preferences across all categories
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-gray-200">
          <button
            onClick={() => {
              setNotifications({ ...originalNotifications });
            }}
            disabled={!hasChanges || loading}
            className={`px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md font-medium transition-colors ${
              hasChanges && !loading
                ? "hover:bg-gray-50"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#EA1B40] hover:bg-red-600"
            } text-white`}
          >
            {loading ? "Saving..." : hasChanges ? "Update Settings" : "Save Settings"}
          </button>
        </div>
        </div>

        <ShipmentNotifications
          notifications={notifications}
          onNotificationChange={handleNotificationChange}
        />
        
        <BillingandPaymentNotifications
          notifications={notifications}
          onNotificationChange={handleNotificationChange}
        />
        
        <OffersAndUpdatesNotification
          notifications={notifications}
          onNotificationChange={handleNotificationChange}
        />

        {/* Save Button */}
        
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

export default Page;