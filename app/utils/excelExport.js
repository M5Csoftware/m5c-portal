import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Utility to export shipment data to a nicely formatted Excel file
 * @param {Array} shipments - The list of shipment objects to export
 * @param {string} fileName - Optional filename for the export
 */
export const exportShipmentsToExcel = async (
  shipments,
  fileName = "Shipment_Overview.xlsx",
) => {
  if (!shipments || shipments.length === 0) {
    console.error("No shipments to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Shipments");

  // Define columns
  worksheet.columns = [
    { header: "AWB No", key: "awbNo", width: 20 },
    { header: "Booking Date", key: "date", width: 18 },
    { header: "Shipper Name", key: "shipperFullName", width: 25 },
    { header: "Consignee Name", key: "receiverFullName", width: 25 },
    { header: "Consignee City", key: "receiverCity", width: 15 },
    { header: "Consignee State", key: "receiverState", width: 15 },
    { header: "Consignee Pincode", key: "receiverPincode", width: 15 },
    { header: "Consignee Phone", key: "receiverPhoneNumber", width: 18 },
    { header: "Sector", key: "sector", width: 15 },
    { header: "Service", key: "service", width: 15 },
    { header: "Forwarder", key: "forwarder", width: 15 },
    { header: "Forwarding No", key: "forwardingNo", width: 25 },
    { header: "Pcs", key: "pcs", width: 8 },
    { header: "Actual Wt (kg)", key: "totalActualWt", width: 15 },
    { header: "Vol Wt (kg)", key: "totalVolWt", width: 15 },
    { header: "Charged Wt (kg)", key: "chargedWt", width: 15 },
    { header: "Basic Amt", key: "basicAmt", width: 15 },
    { header: "Total Amount (INR)", key: "totalAmt", width: 15 },
    { header: "Bill No", key: "billNo", width: 15 },
  ];

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEA1B40" }, // M5C primary red
    };
    cell.font = {
      color: { argb: "FFFFFFFF" }, // White text
      bold: true,
      size: 11,
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
  headerRow.height = 30;

  // Add data rows
  shipments.forEach((shipment) => {
    const row = worksheet.addRow({
      awbNo: shipment.awbNo || shipment.awb || "--",
      date: shipment.date
        ? new Date(shipment.date).toLocaleDateString("en-IN")
        : "--",
      shipperFullName: shipment.shipperFullName || "--",
      receiverFullName: shipment.receiverFullName || "--",
      receiverCity: shipment.receiverCity || "--",
      receiverState: shipment.receiverState || "--",
      receiverPincode: shipment.receiverPincode || "--",
      receiverPhoneNumber: shipment.receiverPhoneNumber || "--",
      sector: shipment.sector || "--",
      service: shipment.service || "--",
      forwarder: shipment.forwarded || "--",
      forwardingNo: shipment.forwordingNo || "--",
      pcs: shipment.pcs || 0,
      totalActualWt: shipment.totalActualWt || shipment.weight || 0,
      totalVolWt: shipment.totalVolWt || 0,
      chargedWt: shipment.chargedWt || shipment.totalActualWt || 0,
      basicAmt: shipment.basicAmt || 0,
      totalAmt: shipment.totalAmt || shipment.amount || 0,
      billNo: shipment.billNo || "--",
    });

    // Add alternate row shading for readability
    // if (row.number % 2 === 0) {
    //     row.fill = {
    //         type: 'pattern',
    //         pattern: 'solid',
    //         fgColor: { argb: 'FFF9FAFB' }
    //     };
    // }

    // Align numbers to right
    row.getCell("pcs").alignment = { horizontal: "right" };
    row.getCell("totalActualWt").alignment = { horizontal: "right" };
    row.getCell("totalVolWt").alignment = { horizontal: "right" };
    row.getCell("totalAmt").alignment = { horizontal: "right" };

    // Add borders to all cells in the row
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  // Finalize and download
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName);
};
