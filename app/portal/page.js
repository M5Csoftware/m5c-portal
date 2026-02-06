"use client";
import React, { useEffect, useState, useContext, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ShipmentOverviewDashboard from "./dashboard/ShipmentOverviewDashboard";
import RecentShipments from "./dashboard/RecentShipments";
import { useSession } from "next-auth/react";
import AwbInput from "../components/AwbInput";
import { GlobalContext } from "./GlobalContext";
import axios from "axios";

const Page = () => {
  const [activeDuration, setActiveDuration] = useState("12 Months");
  const { data: session } = useSession();
  const { server, accountCode } = useContext(GlobalContext);
  const [isQuickActionActive, setIsQuickActionActive] = useState(false);
  const [shipmentCount, setShipmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [holdShipmentsCount, setHoldShipmentsCount] = useState(0);
  const [holdShipmentsData, setHoldShipmentsData] = useState([]);
  const [holdLoading, setHoldLoading] = useState(true);
  const [currentReasonIndex, setCurrentReasonIndex] = useState(0);

  // State variables for l2 values in StatTab components
  const [currency, setCurrency] = useState("INR");
  const [totalBalance, setTotalBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [todaysRevenue, setTodaysRevenue] = useState(500000);
  const [airwaybillStock, setAirwaybillStock] = useState(1000);

  const formattedTotalBalance = new Intl.NumberFormat("en-IN").format(
    totalBalance,
  );
  const formattedtodaysRevenue = new Intl.NumberFormat("en-IN").format(
    todaysRevenue,
  );

  // Get accountCode from session if not in GlobalContext
  const finalAccountCode =
    accountCode || session?.user?.accountCode || session?.user?.email;

  // Track if balance has been fetched
  const balanceFetchedRef = useRef(false);
  const isRefreshingRef = useRef(false);

  // Fetch balance function
  const fetchBalance = async () => {
    if (!finalAccountCode || !server) {
      console.error("No account code or server available");
      setBalanceLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isRefreshingRef.current) {
      console.log("Balance fetch already in progress, skipping...");
      return;
    }

    try {
      isRefreshingRef.current = true;
      setBalanceLoading(true);
      console.log(
        "Fetching balance from:",
        `${server}/payment/balance?accountCode=${finalAccountCode}`,
      );

      const response = await axios.get(
        `${server}/payment/balance?accountCode=${finalAccountCode}`,
      );

      console.log("Balance response:", response.data);

      if (response.data.success) {
        setTotalBalance(response.data.balance || 0);
        balanceFetchedRef.current = true;
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setTotalBalance(0);
    } finally {
      setBalanceLoading(false);
      isRefreshingRef.current = false;
    }
  };

  // Initial balance fetch - only once
  useEffect(() => {
    if (finalAccountCode && server && !balanceFetchedRef.current) {
      fetchBalance();
    }
  }, [finalAccountCode, server]);

  // Listen for payment success event only
  useEffect(() => {
    const handlePaymentSuccess = () => {
      console.log(
        "Payment success event received in dashboard, refreshing balance...",
      );
      setTimeout(() => {
        fetchBalance();
      }, 1000); // Small delay to ensure backend has updated
    };

    // Listen for custom event
    window.addEventListener("paymentSuccess", handlePaymentSuccess);

    // Listen for storage event (for cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === "paymentSuccess") {
        setTimeout(() => {
          fetchBalance();
        }, 1000);
        localStorage.removeItem("paymentSuccess");
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("paymentSuccess", handlePaymentSuccess);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [finalAccountCode, server]);

  // Fetch shipment count for the user
  useEffect(() => {
    const fetchShipmentCount = async () => {
      if (!session?.user?.accountCode || !server) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${server}/portal/get-shipments?accountCode=${session.user.accountCode}`,
        );

        if (!response.ok) {
          setShipmentCount(0);
          setHoldShipmentsCount(0);
          return;
        }

        const data = await response.json();

        if (data.shipments && Array.isArray(data.shipments)) {
          setShipmentCount(data.shipments.length);

          const holdCount = data.shipments.filter(
            (shipment) =>
              shipment.status?.toLowerCase().includes("hold") ||
              shipment.status?.toLowerCase().includes("pending"),
          ).length;
          setHoldShipmentsCount(holdCount);
        } else {
          setShipmentCount(0);
          setHoldShipmentsCount(0);
        }
      } catch (error) {
        console.error("Error fetching shipment count:", error);
        setShipmentCount(0);
        setHoldShipmentsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentCount();
  }, [session, server]);

  const handleGraphDurationChange = (duration) => {
    setActiveDuration(duration);
  };

  const handlePrevClick = () => {
    setCurrentReasonIndex((prev) =>
      prev === 0 ? holdShipmentsData.length - 1 : prev - 1,
    );
  };

  const handleNextClick = () => {
    setCurrentReasonIndex((prev) =>
      prev === holdShipmentsData.length - 1 ? 0 : prev + 1,
    );
  };

  const currentHold = holdShipmentsData[currentReasonIndex];

  useEffect(() => {
    const fetchHoldShipments = async () => {
      if (!finalAccountCode || !server) {
        setHoldLoading(false);
        return;
      }

      try {
        setHoldLoading(true);
        const res = await axios.get(
          `${server}/portal/dashboard-hold?accountCode=${finalAccountCode}&isHold=true&limit=10`,
        );

        if (res.data?.shipments) {
          setHoldShipmentsData(res.data.shipments);
          setHoldShipmentsCount(res.data.shipments.length);
        } else {
          setHoldShipmentsData([]);
          setHoldShipmentsCount(0);
        }
      } catch (err) {
        console.error("Hold fetch error:", err);
        setHoldShipmentsData([]);
        setHoldShipmentsCount(0);
      } finally {
        setHoldLoading(false);
      }
    };

    fetchHoldShipments();
  }, [finalAccountCode, server]);

  return (
    <div className="flex flex-col gap-4 px-9 relative">
      <div className="flex w-full justify-between py-2 text-lg font-bold items-center">
        <span className="font-extrabold text-3xl">
          Hi! {session && session.user.name}
        </span>
        <Link href="./portal/createshipment">
          <button className="text-white bg-[var(--primary-color)] font-bold text-xl rounded-lg px-8 py-4">
            Create Shipment
          </button>
        </Link>
      </div>
      <div className="flex gap-4">
        <StatTab
          l1="Total Balance"
          l2={
            balanceLoading
              ? "Loading..."
              : `${formattedTotalBalance} ${currency}`
          }
          logo="/wallet_white.svg"
        />
        <StatTab
          l1="Today's Revenue"
          l2={`${formattedtodaysRevenue} ${currency}`}
          logo="/revenue_white.svg"
        />
        <StatTab
          l1="Hold Shipments"
          l2={holdShipmentsCount}
          logo="/hold_white.svg"
        />
      </div>

      {/* Main Content Grid - Left and Right Sections */}
      <div className="flex w-full gap-6">
        {/* Left Column - Track Shipment and Hold Shipments */}
        <div className="flex flex-col gap-6 w-2/5 h-full">
          {/* Track Shipment Section */}
          {loading ? (
            <div className="bg-[#FFE3E4] rounded-lg p-6 flex items-center justify-center">
              <div className="text-[#18181B]">Loading shipment data...</div>
            </div>
          ) : (
            <AwbInput
              setIsQuickActionActive={setIsQuickActionActive}
              shipmentCount={shipmentCount}
            />
          )}

          {/* Hold Shipments Section */}
          {holdLoading || holdShipmentsData.length === 0 ? (
            <div className="bg-[#FFE3E4] rounded-lg p-6 flex flex-col gap-4 border border-[#E2E8F0] flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">No Shipment on Hold</h2>
              </div>
              <div className="bg-[#FFE3E4] flex flex-col items-center justify-center rounded-lg p-8 flex-1">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/hold-shipment.svg"
                    alt="No Hold Shipments"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#18181B] mb-2">
                  No Shipment on Hold
                </h3>
                <p className="text-[#727C88] text-sm mb-6 text-center">
                  You&apos;re clear, no action required
                </p>
                <Link href="../portal/shipments">
                  <button className="bg-[#EA1B40] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-all">
                    View Shipments
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFE3E4] rounded-lg p-4 flex flex-col gap-4 border border-[#E2E8F0] flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Hold Shipments</h2>
                <span className="bg-[var(--primary-color)] px-2 py-1 text-white rounded-lg text-sm">
                  {`${currentReasonIndex + 1}/${holdShipmentsData.length}`}
                </span>
              </div>
              <div className="bg-white flex flex-col gap-2 rounded-lg p-4">
                <div className="text-xs text-[#71717A] flex w-full justify-between">
                  <span>
                    {currentHold?.date
                      ? new Date(currentHold.date).toLocaleDateString("en-IN")
                      : "--"}
                  </span>{" "}
                  <span>Airwaybill</span>
                </div>
                <div className="font-semibold text-sm">
                  <div className="font-semibold text-sm">
                    {currentHold?.awbNo || "--"}
                  </div>{" "}
                </div>
                <div className="flex gap-4 items-baseline justify-between">
                  <div className="text-[#BB1C3A] text-sm">
                    {currentHold?.holdReason ||
                      currentHold?.status ||
                      "On Hold"}
                  </div>{" "}
                  <div>
                    <button className="text-white bg-[var(--primary-color)] text-sm rounded-lg p-4">
                      Make Payment
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    className="bg-[var(--primary-color)] py-2 px-3 rounded-md disabled:opacity-50"
                    onClick={handlePrevClick}
                    disabled={holdShipmentsData.length < 1 || currentReasonIndex === 0}
                  >
                    <Image
                      width={10} 
                      height={10}
                      src="/left_arrow_white.svg"
                      alt="left_arrow_white"
                    />
                  </button>
                  <button
                    className="bg-[var(--primary-color)] py-2 px-3 rounded-md disabled:opacity-50"
                    onClick={handleNextClick}
                    disabled={currentReasonIndex === holdShipmentsData.length - 1}
                  >
                    <Image
                      width={10}
                      height={10}
                      src="/right_arrow_white.svg"
                      alt="right_arrow_white"
                    />
                  </button>
                </div>
                <Link
                  href="../portal/shipments"
                  className="text-[#BB1C3A] text-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>See All Shipments</span>
                  <span>
                    <Image
                      width={10}
                      height={10}
                      src="/right_arrow_red.svg"
                      alt="right_arrow_red"
                    />
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Shipment Overview */}
        <div className="flex flex-col gap-6 w-3/5">
          <div className="bg-white rounded-lg flex flex-col gap-4 p-6 border border-[#E2E8F0] h-full">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">Shipment Overview</div>
              <div className="flex gap-4">
                <GraphYearSelect
                  duration="12 Months"
                  isActive={activeDuration === "12 Months"}
                  onClick={() => handleGraphDurationChange("12 Months")}
                />
                <GraphYearSelect
                  duration="6 Months"
                  isActive={activeDuration === "6 Months"}
                  onClick={() => handleGraphDurationChange("6 Months")}
                />
                <GraphYearSelect
                  duration="30 Days"
                  isActive={activeDuration === "30 Days"}
                  onClick={() => handleGraphDurationChange("30 Days")}
                />

                <div className="flex items-center border-2 border-gray-200 px-4 py-2 rounded-lg">
                  <button className="flex items-center gap-2">
                    <Image
                      width={14}
                      height={14}
                      src="/export-pdf.svg"
                      alt="export pdf"
                    />
                    <span className="text-xs font-bold">Export PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Show shipment overview image when no shipments, otherwise show dashboard */}
            {shipmentCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 flex-1">
                <div className="flex flex-col items-center text-center">
                  {/* Shipment Overview Image */}
                  <div className="flex justify-center mb-6">
                    <Image
                      src="/shipment-overview.svg"
                      alt="No Shipments Analytics"
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </div>

                  {/* Text Content */}
                  <h3 className="text-xl font-bold text-[#18181B] mb-2">
                    Start shipping to see your analytics
                  </h3>
                  <p className="text-[#727C88] text-sm mb-6">
                    Your shipment data will appear here
                  </p>

                  {/* Create Shipment Button */}
                  <Link href="./portal/createshipment" className="inline-flex">
                    <button className="bg-[#EA1B40] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-all">
                      Create Shipment
                      <Image
                        width={20}
                        height={20}
                        src="/right-arrow-white.svg"
                        alt="arrow right"
                        className="ml-1"
                      />
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <ShipmentOverviewDashboard duration={activeDuration} />
              </div>
            )}
          </div>

          {/* Graph Status Cards - Always visible */}
          <div className="flex gap-4 justify-between">
            <GraphStatus label="Total Shipments" no={shipmentCount} />
            <GraphStatus
              label="Delivered"
              no={shipmentCount > 0 ? "18" : "0"}
            />
            <GraphStatus label="Pending" no={shipmentCount > 0 ? "3" : "0"} />
            <GraphStatus label="RTO" no={shipmentCount > 0 ? "1" : "0"} />
          </div>
        </div>
      </div>

      {/* Recent Shipments section - ALWAYS VISIBLE */}
      <div className="mb-4">
        <RecentShipments />
      </div>
    </div>
  );
};

const GraphYearSelect = ({ duration, isActive, onClick }) => {
  return (
    <div
      className={`text-xs transition-all border-2 px-4 py-2 rounded-lg font-bold cursor-pointer ${
        isActive ? "border-gray-400" : "border-transparent"
      }`}
      onClick={onClick}
    >
      {duration}
    </div>
  );
};

const GraphStatus = (props) => {
  return (
    <div className="flex flex-col items-center bg-white px-4 py-2 w-[200px] h-fit gap-2 rounded-lg border border-[#E2E8F0]">
      <div className="font-bold">{props.no}</div>
      <div className="text-xs text-gray-400">{props.label}</div>
    </div>
  );
};

const StatTab = (props) => {
  return (
    <div className="bg-white flex font-bold rounded-lg justify-between border border-[#E2E8F0] p-4 items-center w-full">
      <div className="flex flex-col">
        <span className="text-[#A0AEC0] text-xs">{props.l1}</span>
        <span>{props.l2}</span>
      </div>
      <div className="rounded-lg bg-[var(--primary-color)] p-2">
        <Image width={20} height={20} src={props.logo} alt={props.l1} />
      </div>
    </div>
  );
};

export default Page;
