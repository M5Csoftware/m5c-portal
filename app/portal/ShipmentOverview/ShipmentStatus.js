"use client"
import axios from "axios";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../GlobalContext";

const ShipmentStatus = ({ awb }) => {
  const { server } = useContext(GlobalContext);
  const [shipmentData, setShipmentData] = useState({
    status: {
      confirmed: false,
      receivedAtHub: false,
      inTransit: false,
      reachedDestination: false,
      outForDelivery: false,
      delivered: false,
    },
    events: [],
    latestStatus: "",
    lastUpdated: null,
  });

  const statusSteps = [
    { key: "confirmed", label: "Shipment Confirmed" },
    { key: "receivedAtHub", label: "Shipment Received at Hub" },
    { key: "inTransit", label: "In Transit" },
    { key: "reachedDestination", label: "Reached at Destination City" },
    { key: "outForDelivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  // Event code mapping to status steps
  const eventCodeMapping = {
    // Shipment Confirmed
    SRD: "confirmed", // Shipment Registered / Created
    SIR: "confirmed", // Shipment Information Received
    PUC: "confirmed", // Pickup Scheduled / Awaiting Pickup
    PUP: "confirmed", // Picked Up

    // Received at Hub
    OPR: "receivedAtHub", // Processed at Origin Hub
    ORF: "receivedAtHub", // Origin Facility Scan

    // In Transit
    DPT: "inTransit", // Departed from Origin Gateway
    INT: "inTransit", // In Transit (Hub to Hub / Line Haul)
    OGH: "inTransit", // Arrived at Origin Gateway Hub
    FLT: "inTransit", // Flight Departure
    EXP: "inTransit", // Export Customs Clearance
    IMP: "inTransit", // Import Customs Clearance

    // Reached Destination
    DGH: "reachedDestination", // Arrived at Destination Gateway Hub
    DCF: "reachedDestination", // Destination Facility Arrival
    DPH: "reachedDestination", // Processed at Destination Hub

    // Out for Delivery
    OFD: "outForDelivery", // Out for Delivery
    ATT: "outForDelivery", // Attempted Delivery (Customer Not Available / Address Issue)

    // Delivered
    DLV: "delivered", // Delivered (POD Updated)
  };

  // Function to determine status based on event codes
  const calculateStatusFromEvents = (events) => {
    const status = {
      confirmed: false,
      receivedAtHub: false,
      inTransit: false,
      reachedDestination: false,
      outForDelivery: false,
      delivered: false,
    };

    // Check for RTO (Return to Origin) - special case
    const hasRTO = events.some((event) => event.eventCode === "RTO");

    if (hasRTO) {
      // If package is returned to origin, only show confirmed and receivedAtHub
      status.confirmed = true;
      status.receivedAtHub = true;
      return { status, isReturned: true };
    }

    // Process events and update status
    events.forEach((event) => {
      const eventCodes = Array.isArray(event.eventCode)
        ? event.eventCode
        : [event.eventCode];

      eventCodes.forEach((code) => {
        const statusKey = eventCodeMapping[code];
        if (statusKey) {
          status[statusKey] = true;

          // Mark all previous steps as completed
          const currentStepIndex = statusSteps.findIndex(
            (step) => step.key === statusKey
          );
          for (let i = 0; i <= currentStepIndex; i++) {
            status[statusSteps[i].key] = true;
          }
        }
      });
    });

    return { status, isReturned: false };
  };

  // Get the latest event status text
  const getLatestStatus = (events) => {
    if (!events || events.length === 0)
      return "No tracking information available";

    // Find the most recent event
    // const sortedEvents = [...events].sort(
    //   (a, b) =>
    //     new Date(b.eventLogTime || b.updatedAt) -
    //     new Date(a.eventLogTime || a.updatedAt)
    // );

    const sortedEvents = [...events].sort(
      (a, b) =>
        new Date(
          (b.eventLogTime && b.eventLogTime[0]?.$date) || b.updatedAt
        ) -
        new Date(
          (a.eventLogTime && a.eventLogTime[0]?.$date) || a.updatedAt
        )
    );


    const latestEvent = sortedEvents[0];
    const eventCodes = Array.isArray(latestEvent.eventCode)
      ? latestEvent.eventCode
      : [latestEvent.eventCode];
    const statuses = Array.isArray(latestEvent.status)
      ? latestEvent.status
      : [latestEvent.status];

    return (
      statuses[statuses.length - 1] ||
      eventCodes[eventCodes.length - 1] ||
      "Status unknown"
    );
  };

  useEffect(() => {
    if (!awb) return;

    axios
      .get(`${server}/event-activity?awbNo=${awb}`)
      .then((res) => {
        const rawData = res.data;

        // ✅ Ensure we always have an array
        const events = Array.isArray(rawData) ? rawData : [rawData];

        // ✅ Fix destructuring (status renamed to eventStatus)
        const { status: eventStatus, isReturned } =
          calculateStatusFromEvents(events);
        const latestStatus = getLatestStatus(events);
        const lastUpdated =
          events[0]?.updatedAt || events[0]?.eventLogTime || null;

        setShipmentData({
          status: eventStatus,
          events,
          latestStatus,
          lastUpdated,
          isReturned,
        });
      })
      .catch((error) => {
        console.error("Error fetching shipment data:", error);
        setShipmentData((prev) => ({
          ...prev,
          latestStatus: "Error fetching tracking information",
        }));
      });
  }, [awb]);

  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200  w-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-[#EA1B40] text-white rounded-full flex items-center justify-center text-sm">
          <Image width={24} height={24} src={"/Shipment-Details.svg"} alt="Shipment-Details" />
        </div>
        <h2 className="text-lg font-semibold text-[#EA1B40]">
          Shipment Status
        </h2>
      </div>

      <div className="relative px-4">
        {/* Progress Line Background */}
        <div className="absolute top-[9px] left-20 right-9 h-0.5 border-t-2 border-dashed border-gray-300"></div>

        {/* Status Steps */}
        <div className="flex justify-between items-start relative">
          {statusSteps.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full z-10 ${shipmentData.status && shipmentData.status[step.key]
                  ? "bg-green-500"
                  : "bg-white border-2 border-[#667085]"
                  }`}
              ></div>
              <span className="text-xs text-[#344054] mt-3 text-center leading-tight font-semibold">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipmentStatus;
