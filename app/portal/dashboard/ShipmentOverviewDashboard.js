"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

const ShipmentOverviewDashboard = ({ duration }) => {
  const { server, accountCode } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [chartData, setChartData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get accountCode from session if not in GlobalContext
  const finalAccountCode =
    accountCode || session?.user?.accountCode || session?.user?.email;

  // Define color palette for countries
  const countryColors = {
    USA: "#8D0E30",
    UK: "#A50F34",
    Canada: "#C50B31",
    Europe: "#D12C46",
    "New Zealand": "#EA1B40",
    Australia: "#FF6C7B",
    Unknown: "#736E6E"
  };

  // Calculate bar size based on duration
  const getBarSize = (duration) => {
    switch (duration) {
      case "12 Months":
        return 26;
      case "6 Months":
        return 52;
      case "30 Days":
        return 8;
      default:
        return 26;
    }
  };

  // Calculate total shipments for each time period
  const calculateTotals = (entry) => {
    let total = 0;
    countries.forEach((country) => {
      total += entry[country] || 0;
    });
    return total;
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!finalAccountCode || !server) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${server}/portal/shipment-analytics?accountCode=${finalAccountCode}&duration=${duration}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const result = await response.json();

        if (result.success) {
          setChartData(result.data || []);
          setCountries(result.countries || []);
        } else {
          setError("No data available");
          setChartData([]);
          setCountries([]);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
        setChartData([]);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [finalAccountCode, server, duration]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[290px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA1B40] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[290px]">
        <div className="text-center text-red-600">
          <p>Error loading analytics</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[290px]">
        <div className="text-center text-gray-500">
          <p>No shipment data available</p>
          <p className="text-sm mt-2">Create shipments to see analytics</p>
        </div>
      </div>
    );
  }

  const barSize = getBarSize(duration);

  return (
    <ResponsiveContainer width="100%" height={290}>
      <BarChart
        width={500}
        height={300}
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis
          dataKey="name"
          tick={{ fontSize: 14 }}
          axisLine={{ stroke: "#E2E8F0", strokeWidth: 3 }}
          tickLine={{ display: "none" }}
          padding={{ left: 10, right: 10, bottom: 10, top: 10 }}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "8px",
          }}
        />
        <Legend
          alignmentBaseline="middle"
          iconSize={14}
          iconType="circle"
          align="center"
          formatter={(value) => (
            <span
              className="text-sm"
              style={{ padding: "2px", marginRight: "30px" }}
            >
              {value}
            </span>
          )}
        />

        {/* Render bars dynamically based on available countries */}
        {countries.map((country, index) => {
          const isLast = index === countries.length - 1;
          const color =
            countryColors[country] ||
            `hsl(${(index * 360) / countries.length}, 70%, 50%)`;

          return (
            <Bar
              key={country}
              cursor="pointer"
              barSize={barSize}
              radius={isLast ? [4, 4, 0, 0] : [0, 0, 4, 4]}
              dataKey={country}
              stackId="a"
              fill={color}
            >
              {isLast && (
                <LabelList
                  dataKey={calculateTotals}
                  position="top"
                  style={{ fill: "#EA1B40", fontSize: 12, fontWeight: "bold" }}
                />
              )}
            </Bar>
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ShipmentOverviewDashboard;
