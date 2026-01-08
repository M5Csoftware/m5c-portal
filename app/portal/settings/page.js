"use client";
import React from "react";
import SettingBox from "./SettingBox";

const page = () => {
  return (
    <main className="w-full px-9 py-2 flex flex-col gap-6 relative">
      <h1 className="font-bold text-2xl text-[#18181B]">Settings</h1>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 w-fit">
        <SettingBox
          logo="/settings/company.svg"
          label="Company"
          settingList={[
            { name: "Company Profile", link: "/portal/profile" },
            { name: "KYC", link: "/portal/profile" },
            { name: "Change Password", link: "/portal/profile" },
          ]}
        />
        <SettingBox
          logo="/settings/pickup-address.svg"
          label="Pickup Address"
          settingList={[
            { name: "Manage Pickup Address", link: "/portal/manage-pickup" },
            { name: "Manage Billing Address", link: "/portal/billing-address" },
          ]}
        />
        <SettingBox
          logo="/settings/billing.svg"
          label="Billing"
          settingList={[
            { name: "GST Invoicing", link: "/portal/billing/gst-invoicing" },
            { name: "CSV Settings", link: "/portal/billing/gst-invoicing?tab=csb-setting" },
            { name: "TDS", link: "/portal/billing/gst-invoicing?tab=tds" },
          ]}
        />
        <SettingBox
          logo="/settings/label.svg"
          label="Custom Label"
          settingList={[
            { name: "Label Preferences", link: "/portal/label-preferences" },
          ]}
        />
        <SettingBox
          logo="/settings/notification.svg"
          label="Notifications"
          settingList={[
            {
              name: "Shipment Notifications",
              link: "/portal/shipment-notifications",
            },
            {
              name: "Inventory Notifications",
              link: "/portal/inventory-notifications",
            },
            {
              name: "Billing and Payment Notifications",
              link: "/portal/billing-notifications",
            },
            {
              name: "Offers and Update Notification",
              link: "/portal/offer-updates",
            },
          ]}
        />
        <SettingBox
          logo="/settings/api.svg"
          label="API"
          settingList={[
            { name: "Request API", link: "/portal/request-api" }
          ]}
        />
        <SettingBox
          logo="/settings/faq.svg"
          label="FAQ"
          settingList={[
            { name: "General Questions", link: "/portal/customer-support?tab=help-articles&section=general" },
            {
              name: "Shipping and Delivery",
              link: "/portal/customer-support?tab=help-articles&section=shipping",
            },
            {
              name: "Inventory Management",
              link: "/portal/customer-support?tab=help-articles&section=inventory",
            },
            { name: "Account Settings", link: "/portal/customer-support?tab=help-articles&section=account" },
            { name: "More", link: "/portal/customer-support?tab=help-articles" },
          ]}
        />
        <SettingBox
          logo="/settings/privacy.svg"
          label="Privacy & Security"
          settingList={[
            {
              name: "Data Privacy & Security",
              link: "/portal/privacy-security?tab=password",
            },
            {
              name: "Compliance Center",
              link: "/portal/privacy-security?tab=compliance",
            },
            {
              name: "Cookie Policy",
              link: "/portal/privacy-security?tab=cookie",
            },
            {
              name: "Delete My Account",
              link: "/portal/privacy-security?tab=delete",
            },
          ]}
        />
      </div>
    </main>
  );
};

export default page;