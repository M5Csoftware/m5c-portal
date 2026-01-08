"use client";
import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

// RedCheckbox Component
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
          isChecked ? "border-[var(--primary-color)] bg-[var(--primary-color)]" : "border-gray-400"
        }`}
      >
        {isChecked && <Check className="w-5 h-5 text-white" />}
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

function ShipmentNotifications({ notifications, onNotificationChange }) {
  const handleCheckboxChange = (id, checked) => {
    onNotificationChange(id, checked);
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    const shipmentKeys = Object.keys(notifications).filter(
      (key) =>
        key.startsWith("shipment") || key.startsWith("manifest")
    );
    
    const allChecked = shipmentKeys.every(
      (key) => notifications[key] === true
    );

    shipmentKeys.forEach((key) => {
      onNotificationChange(key, !allChecked);
    });
  };

  const shipmentKeys = Object.keys(notifications).filter(
    (key) => key.startsWith("shipment") || key.startsWith("manifest")
  );
  
  const isAllSelected = shipmentKeys.every(
    (key) => notifications[key] === true
  );
  const isSomeSelected = shipmentKeys.some(
    (key) => notifications[key] === true
  );

  const notificationTypes = [
    { key: "shipmentCreated", label: "Shipment Created" },
    { key: "shipmentDelayed", label: "Shipment Delayed" },
    { key: "shipmentStatus", label: "Shipment Status" },
    { key: "manifestCreated", label: "Manifest Created" },
    { key: "shipmentHold", label: "Shipment Hold" },
  ];

  return (
    <div className="border border-[#E2E8F0] rounded-lg p-4 overflow-hidden flex flex-col gap-2">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-[#18181B]">
            Shipment Notifications
          </h2>
          <p className="text-xs text-[#979797]">
            Manage alerts related to your shipment lifecycle.
          </p>
        </div>
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 rounded"
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
          className={`grid grid-cols-4 gap-4 p-4 items-center text-xs text-[#18181B] font-medium ${
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

export default ShipmentNotifications;