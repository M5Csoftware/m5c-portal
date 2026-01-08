'use client'
import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const data = [
  { name: 'Jan', USA: 58, UK: 34, Canada: 20, Australia: 15, Europe: 40, 'New Zealand': 10 },
  { name: 'Feb', USA: 67, UK: 45, Canada: 25, Australia: 20, Europe: 45, 'New Zealand': 15 },
  { name: 'Mar', USA: 80, UK: 84, Canada: 30, Australia: 25, Europe: 50, 'New Zealand': 20 },
  { name: 'Apr', USA: 73, UK: 50, Canada: 35, Australia: 30, Europe: 55, 'New Zealand': 25 },
  { name: 'May', USA: 66, UK: 60, Canada: 40, Australia: 35, Europe: 60, 'New Zealand': 30 },
  { name: 'Jun', USA: 70, UK: 55, Canada: 92, Australia: 40, Europe: 65, 'New Zealand': 35 },
  { name: 'Jul', USA: 77, UK: 65, Canada: 50, Australia: 45, Europe: 70, 'New Zealand': 40 },
  { name: 'Aug', USA: 85, UK: 70, Canada: 85, Australia: 50, Europe: 75, 'New Zealand': 45 },
  { name: 'Sep', USA: 95, UK: 75, Canada: 60, Australia: 55, Europe: 80, 'New Zealand': 50 },
  { name: 'Oct', USA: 90, UK: 80, Canada: 65, Australia: 76, Europe: 85, 'New Zealand': 55 },
  { name: 'Nov', USA: 85, UK: 85, Canada: 70, Australia: 98, Europe: 90, 'New Zealand': 60 },
  { name: 'Dec', USA: 100, UK: 90, Canada: 75, Australia: 109, Europe: 95, 'New Zealand': 65 },
];


export default class ShipmentOverviewDashboard extends PureComponent {
  filterData(duration) {
    switch (duration) {
      case "12 Months":
        return { filteredData: data, barSize: 26 }; // Return all data with barSize 26
      case "6 Months":
        return { filteredData: data.slice(-6), barSize: 52 }; // Return last 6 months with barSize 52
      case "30 Days":
        return {
          filteredData: [
            { name: 'Jan', USA: 58, UK: 34, Canada: 20, Australia: 15, Europe: 40, 'New Zealand': 10 },
            { name: 'Feb', USA: 67, UK: 45, Canada: 25, Australia: 20, Europe: 45, 'New Zealand': 15 },
            { name: 'Mar', USA: 80, UK: 84, Canada: 30, Australia: 25, Europe: 50, 'New Zealand': 20 },
            { name: 'Apr', USA: 73, UK: 50, Canada: 35, Australia: 30, Europe: 55, 'New Zealand': 25 },
          ],
          barSize: 94, // barSize 94 for 30 days
        };
      default:
        return { filteredData: data, barSize: 26 };
    }
  }

  // Calculate total orders for each entry
  calculateTotals = (entry) => {
    return entry.USA + entry.UK + entry.Canada + entry.Australia;
  };

  render() {
    const { duration } = this.props;
    const { filteredData, barSize } = this.filterData(duration);

    return (
      <ResponsiveContainer width="100%" height={290}>
        <BarChart
          width={500}
          height={300}
          data={filteredData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name"
            tick={{ fontSize: 14 }}
            axisLine={{ stroke: '#E2E8F0', strokeWidth: 3 }}
            tickLine={{ display: 'none' }}
            padding={{ left: 10, right: 10, bottom: 10, top: 10 }} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Legend alignmentBaseline='middle' iconSize={14} iconType='circle' align='center' wrapperStyle={{

          }} formatter={(value) => (
            <span className='text-sm' style={{ padding: '2px', marginRight: '30px'}}>{value}</span>
          )} />
          <Bar cursor={"pointer"} barSize={barSize} radius={[0, 0, 4, 4]} dataKey="USA" stackId="a" fill="#8D0E30" />  {/* Darkest */}
          <Bar cursor={"pointer"} barSize={barSize} dataKey="UK" stackId="a" fill="#A50F34" />
          <Bar cursor={"pointer"} barSize={barSize} dataKey="Canada" stackId="a" fill="#C50B31" />
          <Bar cursor={"pointer"} barSize={barSize} dataKey="Europe" stackId="a" fill="#D12C46" />
          <Bar cursor={"pointer"} barSize={barSize} dataKey="New Zealand" stackId="a" fill="#EA1B40" />  {/* Lighter */}
          <Bar cursor={"pointer"} barSize={barSize} radius={[4, 4, 0, 0]} dataKey="Australia" stackId="a" fill="#FF6C7B">  {/* Lightest */}
            <LabelList dataKey={this.calculateTotals} position="top" style={{ fill: '#FF0000', fontSize: 12 }} />
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    );
  }
}
