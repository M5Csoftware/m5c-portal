"use client";
import React, { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

// Map Component
const ShipmentMap = ({ origin, destination }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null);
  const [routeLayer, setRouteLayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.async = true;
    script.onload = () => initMap();
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
      if (map) map.remove();
    };
  }, []);

  useEffect(() => {
    if (map && origin && destination) {
      showRoute();
    }
  }, [map, origin, destination]);

  const initMap = () => {
    if (mapRef.current && !map) {
      const L = window.L;
      const newMap = L.map(mapRef.current).setView([20, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(newMap);

      setMap(newMap);
      setMarkersLayer(L.layerGroup().addTo(newMap));
      setRouteLayer(L.layerGroup().addTo(newMap));
    }
  };

  const geocodeLocation = async (location) => {
    if (!location) return null;
    try {
      // Clean up location string - remove extra spaces and normalize
      const cleanLocation = location.trim();

      // Search with addressdetails to get better results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanLocation)}&limit=1&addressdetails=1&accept-language=en`
      );
      const data = await response.json();
      if (data.length === 0) return null;

      const result = data[0];

      console.log('Selected location:', result.display_name);

      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const showRoute = async () => {
    if (!origin || !destination || !map) return;

    setLoading(true);
    const L = window.L;

    try {
      // Clear ALL previous layers thoroughly
      if (routeLayer) {
        routeLayer.clearLayers();
      }
      if (markersLayer) {
        markersLayer.clearLayers();
      }

      // Remove any existing markers from the map
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      console.log('Geocoding origin:', origin);
      console.log('Geocoding destination:', destination);

      // Geocode both locations
      const originCoords = await geocodeLocation(origin);
      const destCoords = await geocodeLocation(destination);

      if (!originCoords || !destCoords) {
        console.error('Failed to geocode locations');
        setLoading(false);
        return;
      }

      console.log('Origin result:', origin, originCoords);
      console.log('Destination result:', destination, destCoords);

      // Origin marker (green)
      const originIcon = L.divIcon({
        html: '<div style="background: #22c55e; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });

      // Destination marker (red)
      const destIcon = L.divIcon({
        html: '<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });

      // Add exactly ONE marker for origin
      L.marker([originCoords.lat, originCoords.lon], { icon: originIcon })
        .bindPopup(`<b>Origin:</b><br/>${origin}<br/><small>${originCoords.displayName}</small>`)
        .addTo(markersLayer)
        .openPopup();

      // Add exactly ONE marker for destination
      L.marker([destCoords.lat, destCoords.lon], { icon: destIcon })
        .bindPopup(`<b>Destination:</b><br/>${destination}<br/><small>${destCoords.displayName}</small>`)
        .addTo(markersLayer);

      // Draw straight air route line with dashed style - exactly ONE line
      const airRoute = L.polyline([
        [originCoords.lat, originCoords.lon],
        [destCoords.lat, destCoords.lon]
      ], {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10', // Dashed line for air route
        className: 'air-route-line'
      }).addTo(routeLayer);

      // Fit map to show both locations
      map.fitBounds(airRoute.getBounds(), { padding: [50, 50] });
    } catch (error) {
      console.error('Map error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[400px] rounded overflow-hidden">
      <div ref={mapRef} className="w-full h-full"></div>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-[#667085] text-sm">Loading map...</div>
        </div>
      )}
    </div>
  );
};

// Updated TrackStatusCard component with corrected field mapping
const TrackStatusCard = ({ event, isLast, isCompleted, index }) => {
  const normalizeDateInput = (dateInput) => {
    if (Array.isArray(dateInput)) {
      return dateInput[dateInput.length - 1];
    }
    return dateInput;
  };

  const formatDate = (dateInput) => {
    const dateString = normalizeDateInput(dateInput);
    if (!dateString) return "Sat, 10th Aug";
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateInput) => {
    const dateString = normalizeDateInput(dateInput);
    if (!dateString) return "05:56 pm";
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Time";

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusText = (event) => {
    if (!event) return "Shipment Confirmed";

    if (Array.isArray(event.status) && event.status.length > 0) {
      return event.status[event.status.length - 1];
    }

    if (event.status) return event.status;

    if (Array.isArray(event.eventCode) && event.eventCode.length > 0) {
      return event.eventCode[event.eventCode.length - 1];
    }

    if (event.eventCode) return event.eventCode;

    if (event.stepLabel) return event.stepLabel;

    return "Shipment Confirmed";
  };

  const getLocationText = (event) => {
    if (!event) return "Bamnoli, Delhi";

    if (Array.isArray(event.eventLocation) && event.eventLocation.length > 0) {
      return event.eventLocation[event.eventLocation.length - 1];
    }

    if (event.eventLocation) return event.eventLocation;

    if (Array.isArray(event.location) && event.location.length > 0) {
      return event.location[event.location.length - 1];
    }

    if (event.location) return event.location;

    if (event.defaultLocation) return event.defaultLocation;

    return "Bamnoli, Delhi";
  };

  return (
    <div className="flex w-full justify-between items-start">
      <div className="flex items-center">
        <div className="w-28">
          <span className="text-[#667085] text-xs">
            {formatDate(
              event?.eventLogTime ||
              event?.updatedAt ||
              event?.date ||
              event?.eventDate
            )}
          </span>
        </div>
        <div className="flex gap-2 relative">
          <div
            className={`w-[18px] h-[18px] rounded-full z-20 flex items-center justify-center ${isCompleted
              ? "bg-green-500"
              : "bg-white border-2 border-[#667085]"
              }`}
          >
            {isCompleted && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
          </div>

          <span className="text-[#344054] font-semibold text-sm">
            {getStatusText(event)}
          </span>

          {!isLast && (
            <div className="absolute top-3 left-2 z-0 w-0 rounded h-24 border-dashed border border-spacing-1 border-[#667085]" />
          )}
        </div>
      </div>
      <div className="flex flex-col text-[#9E9E9E] text-sm py-1">
        <span>Location: {getLocationText(event)}</span>
        <span>
          {formatTime(
            event?.eventLogTime ||
            event?.updatedAt ||
            event?.date ||
            event?.eventDate
          )}
        </span>
      </div>
    </div>
  );
};

function TrackShipment({ awbNumber }) {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();

  const [shipmentData, setShipmentData] = useState({
    awbNo: "M5P625147",
    forwardingNo: "CP197298687585",
    origin: "Delhi",
    destination: "Australia",
    shipmentDate: "Aug 10, 2024",
    estimatedDelivery: "Aug 18, 2024",
    forwarder: "Canada Post", // Changed from deliveryPartner to forwarder
    status: "In transit",
    events: [],
    displayEvents: [],
  });

  const [loading, setLoading] = useState(false);

  const eventCodeMapping = {
    SRD: "confirmed",
    SIR: "confirmed",
    PUC: "confirmed",
    PUP: "confirmed",
    OPR: "receivedAtHub",
    ORF: "receivedAtHub",
    DPT: "inTransit",
    INT: "inTransit",
    OGH: "inTransit",
    FLT: "inTransit",
    EXP: "inTransit",
    IMP: "inTransit",
    DGH: "reachedDestination",
    DCF: "reachedDestination",
    DPH: "reachedDestination",
    OFD: "outForDelivery",
    ATT: "outForDelivery",
    DLV: "delivered",
  };

  const statusSteps = [
    {
      key: "confirmed",
      label: "Shipment Confirmed",
      defaultLocation: "Origin Hub",
      defaultDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      key: "receivedAtHub",
      label: "Shipment Received at Hub",
      defaultLocation: "Processing Hub",
      defaultDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      key: "inTransit",
      label: "In Transit",
      defaultLocation: "Transit Hub",
      defaultDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      key: "reachedDestination",
      label: "Reached at Destination City",
      defaultLocation: "Destination Hub",
      defaultDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      key: "outForDelivery",
      label: "Out for Delivery",
      defaultLocation: "Local Delivery Hub",
      defaultDate: new Date(),
    },
    {
      key: "delivered",
      label: "Delivered",
      defaultLocation: "Customer Address",
      defaultDate: new Date(),
    },
  ];

  const getLatestValue = (arrayField) => {
    if (!arrayField) return null;
    if (Array.isArray(arrayField)) {
      return arrayField.length > 0 ? arrayField[arrayField.length - 1] : null;
    }
    return arrayField;
  };

  const getEventTimestamp = (event) => {
    const timestamp =
      getLatestValue(event.eventLogTime) ||
      getLatestValue(event.eventDate) ||
      event.updatedAt ||
      event.createdAt;

    return timestamp ? new Date(timestamp) : new Date(0);
  };

  const processEventsForProgression = (events) => {
    const completedSteps = new Set();
    let highestStepIndex = -1;

    events.forEach((event) => {
      const eventCodes = Array.isArray(event.eventCode)
        ? event.eventCode
        : [event.eventCode].filter(Boolean);

      eventCodes.forEach((code) => {
        const statusKey = eventCodeMapping[code];
        if (statusKey) {
          completedSteps.add(statusKey);
          const stepIndex = statusSteps.findIndex(
            (step) => step.key === statusKey
          );
          if (stepIndex > highestStepIndex) {
            highestStepIndex = stepIndex;
          }
        }
      });
    });

    for (let i = 0; i <= highestStepIndex; i++) {
      completedSteps.add(statusSteps[i].key);
    }

    return { completedSteps, highestStepIndex };
  };

  const createDisplayEvents = (
    actualEvents,
    completedSteps,
    highestStepIndex
  ) => {
    const displayEvents = [];

    const eventsByStepKey = new Map();
    actualEvents.forEach((event) => {
      const eventCodes = Array.isArray(event.eventCode)
        ? event.eventCode
        : [event.eventCode].filter(Boolean);

      eventCodes.forEach((code) => {
        const stepKey = eventCodeMapping[code];
        if (stepKey) {
          const currentEvent = eventsByStepKey.get(stepKey);
          const eventTimestamp = getEventTimestamp(event);

          if (
            !currentEvent ||
            eventTimestamp > getEventTimestamp(currentEvent)
          ) {
            eventsByStepKey.set(stepKey, event);
          }
        }
      });
    });

    statusSteps.forEach((step, index) => {
      if (index <= Math.min(highestStepIndex + 1, statusSteps.length - 1)) {
        const actualEvent = eventsByStepKey.get(step.key);
        const isCompleted = completedSteps.has(step.key);

        if (actualEvent) {
          displayEvents.push({
            ...actualEvent,
            stepLabel: step.label,
            isCompleted: isCompleted,
          });
        } else {
          displayEvents.push({
            stepLabel: step.label,
            defaultLocation: step.defaultLocation,
            eventLogTime: step.defaultDate.toISOString(),
            isCompleted: isCompleted,
            isPlaceholder: true,
          });
        }
      }
    });

    return displayEvents;
  };

  const getStatusBadge = (status) => {
    let normalizedStatus = "";

    if (Array.isArray(status)) {
      normalizedStatus = status[status.length - 1] || "";
    } else if (typeof status === "string") {
      normalizedStatus = status;
    }

    const statusLower = normalizedStatus.toLowerCase();

    if (statusLower.includes("delivered")) {
      return {
        color: "border-[#12B76A] text-[#12B76A] bg-[#12b76a1f]",
        text: "Delivered",
      };
    } else if (statusLower.includes("out for delivery")) {
      return {
        color: "border-[#F79009] text-[#F79009] bg-[#f790091f]",
        text: "Out for Delivery",
      };
    } else if (
      statusLower.includes("transit") ||
      statusLower.includes("intransit")
    ) {
      return {
        color: "border-[#12B76A] text-[#12B76A] bg-[#12b76a1f]",
        text: "In Transit",
      };
    }

    return {
      color: "border-[#9E9E9E] text-[#9E9E9E] bg-[#9e9e9e1f]",
      text: normalizedStatus || "Unknown",
    };
  };

  useEffect(() => {
    if (!awbNumber) return;

    const fetchShipmentData = async () => {
      setLoading(true);
      try {
        const shipmentDetailsResponse = await axios.get(
          `${server}/portal/get-shipments?awbNo=${awbNumber}`
        );

        const shipmentDetails = shipmentDetailsResponse?.data.shipment || {};

        const sessionAccountCode = session?.user?.accountCode;
        const shipmentAccountCode = shipmentDetails?.accountCode;

        if (!shipmentAccountCode || shipmentAccountCode !== sessionAccountCode) {
          console.log("Account mismatch, not fetching events.");
          setShipmentData((prev) => ({
            ...prev,
            ...shipmentDetails,
            status: "Not authorized",
          }));
          setLoading(false);
          return;
        }

        const eventsResponse = await axios.get(
          `${server}/event-activity?awbNo=${awbNumber}`
        );

        const rawData = eventsResponse.data;
        let events = [];

        if (Array.isArray(rawData)) {
          events = rawData;
        } else if (rawData && typeof rawData === "object") {
          const document = rawData;
          if (document.eventCode && Array.isArray(document.eventCode)) {
            for (let i = 0; i < document.eventCode.length; i++) {
              events.push({
                eventCode: document.eventCode[i],
                eventDate: document.eventDate?.[i],
                eventTime: document.eventTime?.[i],
                status: document.status?.[i],
                eventUser: document.eventUser?.[i],
                eventLocation: document.eventLocation?.[i],
                eventLogTime: document.eventLogTime?.[i],
                awbNo: document.awbNo,
                _originalDocument: document,
              });
            }
          } else {
            events = [document];
          }
        }

        const sortedEvents = events.sort(
          (a, b) => getEventTimestamp(b) - getEventTimestamp(a)
        );
        const { completedSteps, highestStepIndex } =
          processEventsForProgression(sortedEvents);

        const displayEvents = createDisplayEvents(
          sortedEvents,
          completedSteps,
          highestStepIndex
        );

        const latestEvent = sortedEvents[0];
        let currentStatus =
          getLatestValue(latestEvent?.status) ||
          getLatestValue(latestEvent?.eventCode) ||
          "In transit";

        if (currentStatus?.toLowerCase() === "intransit") {
          currentStatus = "In transit";
        }

        setShipmentData({
          ...shipmentDetails,
          awbNo: shipmentDetails.awbNo || awbNumber,
          forwardingNo: shipmentDetails.forwardingNo || "N/A",
          origin: shipmentDetails.origin || "Unknown",
          destination: shipmentDetails.destination || "Unknown",
          sector: shipmentDetails.sector || "",
          shipmentDate: shipmentDetails.date || "N/A",
          estimatedDelivery: shipmentDetails.estimatedDelivery || "N/A",
          forwarder: shipmentDetails.forwarder || "N/A", // Use forwarder instead of deliveryPartner
          status: currentStatus,
          events: sortedEvents,
          displayEvents,
          completedSteps,
        });
      } catch (error) {
        console.error("Error fetching shipment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();

    const interval = setInterval(fetchShipmentData, 30000);
    return () => clearInterval(interval);
  }, [awbNumber]);

  const statusBadge = getStatusBadge(shipmentData.status);

  return (
    <div className="flex gap-5 pb-9">
      <div className="flex flex-col text-sm w-full gap-5">
        <div className="flex flex-col bg-white p-5 border border-[#E2E8F0] rounded w-full">
          <div className="flex flex-col gap-7">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div className="text-[#667085] w-24">AWB No:</div>
                  <div className="font-semibold text-[#344054]">
                    {shipmentData.awbNo || awbNumber}
                  </div>
                </div>
                <div className="flex gap-5">
                  <div
                    className={`border font-semibold px-5 py-2 rounded-md ${statusBadge.color}`}
                  >
                    {statusBadge.text}
                  </div>
                  <Image
                    className="cursor-pointer"
                    src="/tracking/kabab-menu.svg"
                    width={4}
                    height={30}
                    alt=""
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-[#667085] w-24">Forwarding No:</div>
                <div className="underline cursor-pointer font-semibold text-[var(--primary-color)]">
                  {shipmentData.forwardingNo || "N/A"}
                </div>
              </div>
              {shipmentData.reference && (
                <div className="flex gap-6 mt-2">
                  <div className="text-[#667085] w-24">Reference:</div>
                  <div className="text-[#344054]">{shipmentData.reference}</div>
                </div>
              )}
              {shipmentData.shipmentType && (
                <div className="flex gap-6 mt-2">
                  <div className="text-[#667085] w-24">Type:</div>
                  <div className="text-[#344054]">
                    {shipmentData.shipmentType}
                  </div>
                </div>
              )}
              {(shipmentData.pcs > 0 || shipmentData.totalActualWt > 0) && (
                <div className="flex gap-6 mt-2">
                  <div className="text-[#667085] w-24">Details:</div>
                  <div className="text-[#344054]">
                    {shipmentData.pcs > 0 && `${shipmentData.pcs} pcs`}
                    {shipmentData.pcs > 0 &&
                      shipmentData.totalActualWt > 0 &&
                      " • "}
                    {shipmentData.totalActualWt > 0 &&
                      `${shipmentData.totalActualWt} kg`}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-4 text-[#344054] font-semibold">
                <span>{shipmentData.origin || "Origin"}</span>
                <Image
                  src="/tracking/arrow-right.svg"
                  width={67}
                  height={24}
                  alt=""
                />
                <span>{shipmentData.destination || "Destination"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[#1C1917]">Forwarder:</div>
                <div className="text-[#344054] font-semibold">
                  {shipmentData.forwarder}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 border border-[#E2E8F0] rounded flex flex-col gap-11">
          {shipmentData.displayEvents && shipmentData.displayEvents.length > 0
            ? shipmentData.displayEvents.map((event, index, arr) => (
              <div className="relative" key={index}>
                <TrackStatusCard
                  event={event}
                  isLast={index === arr.length - 1}
                  isCompleted={event.isCompleted}
                  index={index}
                />
              </div>
            ))
            : [...Array(4)].map((_, index, arr) => (
              <div className="relative" key={index}>
                <TrackStatusCard
                  isLast={index === arr.length - 1}
                  isCompleted={index === 0}
                  index={index}
                />
              </div>
            ))}

          {loading && (
            <div className="text-center text-[#667085] py-4">
              <div className="animate-pulse">
                Updating tracking information...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col text-sm w-full gap-5">
        <div className="flex flex-col gap-7 bg-white p-5 border border-[#E2E8F0] rounded">
          <div className="text-xs flex justify-between items-center px-4">
            <div className="flex gap-1 items-center">
              <span className="text-[#667085]">Shipment date:</span>
              <span className="text-[#344054] font-semibold">
                {shipmentData.shipmentDate}
              </span>
            </div>

            <div className="flex gap-1 items-center">
              <Image
                src="/tracking/truck.svg"
                alt="M5C Tracking"
                width={14}
                height={14}
              />
              <span className="text-[#12B76A] font-semibold">
                Estimated delivery: {shipmentData.estimatedDelivery}
              </span>
            </div>
          </div>
          <div className="mx-auto w-full">
            <ShipmentMap
              key={`${shipmentData.origin}-${shipmentData.destination}-${shipmentData.sector}`}
              origin={shipmentData.origin}
              destination={`${shipmentData.destination}${shipmentData.sector ? ', ' + shipmentData.sector : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackShipment;