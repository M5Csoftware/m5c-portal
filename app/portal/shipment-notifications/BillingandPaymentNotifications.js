"use client";
import React from "react";
import { Check } from "lucide-react";

function RedCheckbox({ id, isChecked, onChange, disabled = false }) {
  const handleToggle = (e) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(id, !isChecked);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`flex gap-2.5 items-center select-none ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:opacity-80"
      }`}
    >
      <div
        className={`rounded w-[18px] h-[18px] border flex items-center justify-center transition-colors ${
          isChecked ? "border-[var(--primary-color)] bg-[var(--primary-color)]" : "border-[#E2E8F0]"
        }`}
      >
        {isChecked && <Check className="w-3 h-3 text-white" />}
        <input
          id={id}
          type="checkbox"
          checked={isChecked}
          onChange={() => {}}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function BillingandPaymentNotifications({ notifications, onNotificationChange }) {
  const handleCheckboxChange = (id, checked) => {
    onNotificationChange(id, checked);
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const billingKeys = Object.keys(notifications).filter(
      (key) =>
        key.startsWith("newInvoice") ||
        key.startsWith("payment") ||
        key.startsWith("credit") ||
        key.startsWith("billing") ||
        key.startsWith("rate")
    );

    const allChecked = billingKeys.every(
      (key) => notifications[key] === true
    );

    billingKeys.forEach((key) => {
      onNotificationChange(key, !allChecked);
    });
  };

  const billingKeys = Object.keys(notifications).filter(
    (key) =>
      key.startsWith("newInvoice") ||
      key.startsWith("payment") ||
      key.startsWith("credit") ||
      key.startsWith("billing") ||
      key.startsWith("rate")
  );

  const isAllSelected = billingKeys.every(
    (key) => notifications[key] === true
  );
  const isSomeSelected = billingKeys.some(
    (key) => notifications[key] === true
  );

  const notificationTypes = [
    { key: "newInvoiceGenerated", label: "New Invoice Generated" },
    { key: "paymentDueReminder", label: "Payment Due Reminder" },
    { key: "creditLimitExceededAlert", label: "Credit Limit Exceeded Alert" },
    { key: "creditLimitExceededAlert2", label: "Credit Limit Exceeded Alert" },
    { key: "billingError", label: "Billing Error" },
    { key: "rateHike", label: "Rate Hike" },
  ];

  return (
    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-base font-bold text-[#18181B]">
            Billing and Payment Notifications
          </h2>
          <p className="text-xs text-[#979797]">
            Stay updated on financial activities to avoid disruptions.
          </p>
        </div>
        <button
          onClick={handleSelectAll}
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 rounded hover:bg-red-50 cursor-pointer"
        >
          <div
            className={`w-4 h-4 border rounded flex items-center justify-center ${
              isAllSelected
                ? "border-[var(--primary-color)] bg-[var(--primary-color)]"
                : isSomeSelected
                ? "border-[var(--primary-color)] bg-red-100"
                : "border-[#E2E8F0]"
            }`}
          >
            {isAllSelected && <Check className="w-3 h-3 text-white" />}
            {isSomeSelected && !isAllSelected && (
              <div className="w-2 h-2 bg-[var(--primary-color)] rounded-sm" />
            )}
          </div>
          Select All
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-[#E2E8F0] text-sm font-medium text-[#979797]">
        <div>Notification Type</div>
        <div className="text-center">Email</div>
        <div className="text-center">Portal</div>
      </div>

      {notificationTypes.map((type, index) => (
        <div
          key={type.key}
          className={`grid grid-cols-4 gap-4 p-3 items-center text-xs text-[#18181B] font-medium ${
            index !== notificationTypes.length - 1
              ? "border-b border-[#E2E8F0]"
              : ""
          }`}
        >
          <div className="font-medium text-gray-800">{type.label}</div>

          <div className="flex justify-center">
            <RedCheckbox
              id={`${type.key}_email`}
              isChecked={notifications[`${type.key}_email`] || false}
              onChange={handleCheckboxChange}
            />
          </div>

          <div className="flex justify-center">
            <RedCheckbox
              id={`${type.key}_portal`}
              isChecked={notifications[`${type.key}_portal`] || false}
              onChange={handleCheckboxChange}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default BillingandPaymentNotifications;