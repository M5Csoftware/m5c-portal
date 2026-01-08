"use client";

import { Clock8, Database, TriangleAlert, Download, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../../GlobalContext";
import NotificationFlag from "../../component/NotificationFlag";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DeleteMyAccount = () => {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const router = useRouter();
  
  const [dataSizes, setDataSizes] = useState({
    profile: "Calculating...",
    shipments: "Calculating...",
    ledger: "Calculating..."
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    subMessage: "",
  });

  useEffect(() => {
    if (session?.user?.accountCode) {
      fetchDataSizes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchDataSizes = async () => {
    try {
      const accountCode = session?.user?.accountCode;
      if (!accountCode) return;

      console.log("Fetching data sizes for:", accountCode);

      const response = await axios.get(
        `${server}/portal/privacy-security/setting-delete?accountCode=${accountCode}`
      );

      console.log("Data sizes response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        
        const profileSize = JSON.stringify(data.user).length + 
                           JSON.stringify(data.customerAccount || {}).length;
        const shipmentsSize = JSON.stringify(data.shipments).length;
        const ledgerSize = JSON.stringify(data.ledgerEntries).length;

        setDataSizes({
          profile: formatBytes(profileSize),
          shipments: formatBytes(shipmentsSize),
          ledger: formatBytes(ledgerSize)
        });
      }
    } catch (error) {
      console.error("Error fetching data sizes:", error);
      setDataSizes({
        profile: "N/A",
        shipments: "N/A",
        ledger: "N/A"
      });
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // PDF Generation Functions (keeping all the existing PDF functions)
  const addBannerImage = (doc) => {
    try {
      const img = new Image();
      img.src = '/M5C_banner.png';
      
      return new Promise((resolve) => {
        img.onload = () => {
          try {
            doc.addImage(img, 'PNG', 0, 0, 210, 40);
            console.log("Banner image added successfully");
            resolve(45);
          } catch (error) {
            console.error("Error adding image:", error);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 210, 30, 'F');
            doc.setTextColor(234, 33, 71);
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text('M5C LOGISTICS', 105, 20, { align: 'center' });
            resolve(35);
          }
        };
        
        img.onerror = () => {
          console.warn("Banner image not found, using fallback");
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, 210, 30, 'F');
          doc.setTextColor(234, 33, 71);
          doc.setFontSize(24);
          doc.setFont(undefined, 'bold');
          doc.text('M5C LOGISTICS', 105, 20, { align: 'center' });
          resolve(35);
        };
      });
    } catch (error) {
      console.error("Error in addBannerImage:", error);
      return Promise.resolve(10);
    }
  };

  const addStyledHeader = (doc, title, subtitle, yPos) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, yPos, 210, 20, 'F');
    
    doc.setTextColor(234, 33, 71);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(title, 105, yPos + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.setFont(undefined, 'normal');
    doc.text(subtitle, 105, yPos + 15, { align: 'center' });
    
    return yPos + 22;
  };

  const addSection = (doc, title, yPos) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 10;
    }
    
    doc.setFillColor(249, 250, 251);
    doc.rect(10, yPos, 190, 10, 'F');
    
    doc.setFillColor(234, 33, 71);
    doc.rect(10, yPos, 5, 10, 'F');
    
    doc.setTextColor(234, 33, 71);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(title, 20, yPos + 7);
    
    return yPos + 15;
  };

  const addStyledBox = (doc, yPos, fields, title = null) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 10;
    }
    
    const boxHeight = (title ? 8 : 0) + (fields.length * 6) + 6;
    
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(11, yPos + 1, 188, boxHeight, 3, 3, 'F');
    
    doc.setDrawColor(234, 33, 71);
    doc.setLineWidth(0.5);
    doc.setFillColor(254, 254, 254);
    doc.roundedRect(10, yPos, 188, boxHeight, 3, 3, 'FD');
    
    let currentY = yPos + 5;
    
    if (title) {
      doc.setTextColor(234, 33, 71);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(title, 15, currentY);
      currentY += 8;
    }
    
    doc.setFontSize(10);
    fields.forEach(({ label, value }) => {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text(label, 15, currentY);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      const valueText = value || 'N/A';
      doc.text(valueText.toString(), 80, currentY);
      
      currentY += 6;
    });
    
    return currentY + 5;
  };

  const addStyledTable = (doc, yPos, headers, data, columnStyles = {}) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 10;
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [234, 33, 71],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: columnStyles,
      margin: { left: 10, right: 10 },
    });
    
    return doc.lastAutoTable.finalY + 10;
  };

  const generatePDF = async (userData) => {
    const doc = new jsPDF();
    const { user, customerAccount, shipments, ledgerEntries, accountCode } = userData;
    
    let yPos = await addBannerImage(doc);
    yPos = addStyledHeader(
      doc,
      'Data Export Report',
      `Account Code: ${accountCode} | Generated: ${new Date().toLocaleDateString()}`,
      yPos
    );
    
    doc.setDrawColor(234, 33, 71);
    doc.setLineWidth(1);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    yPos = addSection(doc, '1. User Profile Information', yPos);
    
    yPos = addStyledBox(doc, yPos, [
      { label: 'Full Name:', value: user.fullName },
      { label: 'Email:', value: user.emailId },
      { label: 'Mobile Number:', value: user.mobileNumber },
      { label: 'Account Code:', value: user.accountCode },
    ], 'Account Details');
    
    yPos = addStyledBox(doc, yPos, [
      { label: 'Address Line 1:', value: user.addressLine1 },
      { label: 'Address Line 2:', value: user.addressLine2 },
      { label: 'City:', value: user.city },
      { label: 'State:', value: user.state },
      { label: 'Country:', value: user.country },
      { label: 'Zip Code:', value: user.zipCode },
    ], 'Address');
    
    if (customerAccount) {
      doc.addPage();
      yPos = 10;
      
      yPos = addSection(doc, '2. Customer Account Details', yPos);
      
      yPos = addStyledBox(doc, yPos, [
        { label: 'Name:', value: customerAccount.name },
        { label: 'Account Type:', value: customerAccount.accountType },
        { label: 'Account Status:', value: customerAccount.account },
      ], 'Account Information');
      
      yPos = addStyledBox(doc, yPos, [
        { label: 'Contact Person:', value: customerAccount.contactPerson },
        { label: 'Email:', value: customerAccount.email },
        { label: 'Tel No:', value: customerAccount.telNo },
        { label: 'Billing Email:', value: customerAccount.billingEmailId },
      ], 'Contact Information');
      
      yPos = addStyledBox(doc, yPos, [
        { label: 'Address Line 1:', value: customerAccount.addressLine1 },
        { label: 'Address Line 2:', value: customerAccount.addressLine2 },
        { label: 'City:', value: customerAccount.city },
        { label: 'State:', value: customerAccount.state },
        { label: 'Country:', value: customerAccount.country },
        { label: 'Pin Code:', value: customerAccount.pinCode },
      ], 'Address');
      
      if (yPos > 200) {
        doc.addPage();
        yPos = 10;
      }
      
      yPos = addStyledBox(doc, yPos, [
        { label: 'PAN No:', value: customerAccount.panNo },
        { label: 'TAN No:', value: customerAccount.tanNo },
        { label: 'GST No:', value: customerAccount.gstNo },
        { label: 'KYC No:', value: customerAccount.kycNo },
      ], 'Tax & Compliance');
      
      yPos = addStyledBox(doc, yPos, [
        { label: 'Opening Balance:', value: customerAccount.openingBalance },
        { label: 'Credit Limit:', value: customerAccount.creditLimit },
        { label: 'Left Over Balance:', value: customerAccount.leftOverBalance },
        { label: 'No Of Days Credit:', value: customerAccount.noOfDaysCredit },
      ], 'Financial Details');
    }
    
    doc.addPage();
    yPos = 10;
    yPos = addSection(doc, '3. Shipments Data', yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`Total Shipments: ${shipments.length}`, 15, yPos);
    yPos += 8;
    
    if (shipments.length > 0) {
      const shipmentData = shipments.slice(0, 50).map(s => [
        s.awbNo || '',
        s.date ? new Date(s.date).toLocaleDateString() : '',
        (s.receiverFullName || '').substring(0, 25),
        s.receiverCity || '',
        s.service || '',
        `₹${(s.totalAmt || 0).toFixed(2)}`,
        s.status || '',
      ]);
      
      yPos = addStyledTable(
        doc,
        yPos,
        ['AWB No', 'Date', 'Receiver', 'City', 'Service', 'Amount', 'Status'],
        shipmentData,
        {
          0: { cellWidth: 28 },
          1: { cellWidth: 24 },
          2: { cellWidth: 40 },
          3: { cellWidth: 24 },
          4: { cellWidth: 26 },
          5: { cellWidth: 24 },
          6: { cellWidth: 24 },
        }
      );
      
      if (shipments.length > 50) {
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.setFont(undefined, 'italic');
        doc.text(`... and ${shipments.length - 50} more entries`, 15, yPos);
        yPos += 10;
      }
      
      const totalAmount = shipments.reduce((sum, s) => sum + (s.totalAmt || 0), 0);
      const totalWeight = shipments.reduce((sum, s) => sum + (s.totalActualWt || 0), 0);
      
      yPos = addStyledBox(doc, yPos, [
        { label: 'Total Shipments:', value: shipments.length },
        { label: 'Total Amount:', value: `₹${totalAmount.toFixed(2)}` },
        { label: 'Total Weight:', value: `${totalWeight.toFixed(2)} kg` },
      ], 'Shipment Summary');
    }
    
    doc.addPage();
    yPos = 10;
    yPos = addSection(doc, '4. Account Ledger', yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`Total Ledger Entries: ${ledgerEntries.length}`, 15, yPos);
    yPos += 8;
    
    if (ledgerEntries.length > 0) {
      const ledgerData = ledgerEntries.slice(0, 50).map(l => [
        l.date ? new Date(l.date).toLocaleDateString() : '',
        l.awbNo || '',
        l.payment || '',
        (l.receiverFullName || '').substring(0, 20),
        `₹${(l.debitAmount || 0).toFixed(2)}`,
        `₹${(l.creditAmount || 0).toFixed(2)}`,
        `₹${(l.leftOverBalance || 0).toFixed(2)}`,
      ]);
      
      yPos = addStyledTable(
        doc,
        yPos,
        ['Date', 'AWB', 'Payment', 'Consignee', 'Debit', 'Credit', 'Balance'],
        ledgerData,
        {
          0: { cellWidth: 20 },
          1: { cellWidth: 22 },
          2: { cellWidth: 22 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 20, halign: 'right' },
        }
      );
      
      if (ledgerEntries.length > 50) {
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.setFont(undefined, 'italic');
        doc.text(`... and ${ledgerEntries.length - 50} more entries`, 15, yPos);
        yPos += 10;
      }
      
      const totalDebit = ledgerEntries.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
      const totalCredit = ledgerEntries.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
      const finalBalance = ledgerEntries[ledgerEntries.length - 1]?.leftOverBalance || 0;
      
      yPos = addStyledBox(doc, yPos, [
        { label: 'Total Debit:', value: `₹${totalDebit.toFixed(2)}` },
        { label: 'Total Credit:', value: `₹${totalCredit.toFixed(2)}` },
        { label: 'Final Balance:', value: `₹${finalBalance.toFixed(2)}` },
      ], 'Ledger Summary');
    }
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setDrawColor(234, 33, 71);
      doc.setLineWidth(0.5);
      doc.line(10, 280, 200, 280);
      
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        'This document contains all your personal data stored in our system. Please keep it secure.',
        105,
        285,
        { align: 'center' }
      );
      
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
    }
    
    return doc;
  };

  const handleDownloadData = async () => {
    const accountCode = session?.user?.accountCode;
    if (!accountCode) {
      setNotification({
        visible: true,
        message: "Authentication Error",
        subMessage: "Please login to download your data.",
      });
      return;
    }

    console.log("=== Starting Data Download ===");
    console.log("Account Code:", accountCode);

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    try {
      setDownloadProgress(20);
      const response = await axios.get(
        `${server}/portal/privacy-security/setting-delete?accountCode=${accountCode}`
      );

      setDownloadProgress(50);

      if (response.data.success) {
        const userData = response.data.data;
        
        setDownloadProgress(70);
        const doc = await generatePDF(userData);
        
        setDownloadProgress(90);

        const pdfBlob = doc.output('blob');
        const url = window.URL.createObjectURL(pdfBlob);
        
        setPdfUrl(url);
        setDownloadProgress(100);
        setDownloadComplete(true);

        const link = document.createElement('a');
        link.href = url;
        link.download = `my-data-export-${accountCode}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setNotification({
          visible: true,
          message: "Download Complete",
          subMessage: "Your data has been successfully exported.",
        });
      }

    } catch (error) {
      console.error("Error downloading data:", error);
      console.error("Error response:", error.response?.data);
      
      setNotification({
        visible: true,
        message: "Download Failed",
        subMessage: error.response?.data?.message || "Failed to generate PDF. Please try again.",
      });
      setDownloadProgress(0);
      setDownloadComplete(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const accountCode = session?.user?.accountCode;

      console.log("=== Account Deletion ===");
      console.log("Account Code:", accountCode);

      const response = await axios.post(
        `${server}/portal/privacy-security/account-delete`,
        { accountCode }
      );

      console.log("Delete response:", response.data);

      if (response.data.success) {
        setNotification({
          visible: true,
          message: "Account Deactivated",
          subMessage: "Your account has been deactivated successfully.",
        });

        setTimeout(async () => {
          await signOut({ redirect: false });
          router.push("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      console.error("Error response:", error.response?.data);
      
      setNotification({
        visible: true,
        message: "Delete Failed",
        subMessage: error.response?.data?.message || "Failed to delete account. Please try again.",
      });
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-md bg-white p-8">
          <div className="mb-6">
            <h2 className="font-extrabold text-xl">Download your data</h2>
            <p className="text-gray-600 text-sm mt-1">
              Get a copy of all your personal data in a portable format
            </p>
          </div>

          <div className="flex gap-3 items-center text-gray-600 border-gray-300 border p-4 rounded-md">
            <Database size={22} className="flex-shrink-0" />
            <span className="text-sm">
              Your data export will include all personal information we have
              stored about you. The download may take several minutes depending on
              the amount of data.
            </span>
          </div>

          <h2 className="font-extrabold text-lg mt-6 mb-4">
            What&apos;s included in your data export:
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start border-gray-200 border rounded-md p-5">
              <div>
                <h2 className="font-semibold text-base">Profile Information</h2>
                <span className="text-gray-600 text-sm mt-1 block">
                  Basic profile data, settings, preferences
                </span>
              </div>
              <div>
                <div className="bg-gray-200 py-1.5 px-3 rounded text-sm font-medium">
                  {dataSizes.profile}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start border-gray-200 border rounded-md p-5">
              <div>
                <h2 className="font-semibold text-base">Shipments & Data</h2>
                <span className="text-gray-600 text-sm mt-1 block">
                  Shipments Information, Manifests, RTO
                </span>
              </div>
              <div>
                <div className="bg-gray-200 py-1.5 px-3 rounded text-sm font-medium">
                  {dataSizes.shipments}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start border-gray-200 border rounded-md p-5">
              <div>
                <h2 className="font-semibold text-base">Account Ledger</h2>
                <span className="text-gray-600 text-sm mt-1 block">
                  Payment Details, Shipments Sales
                </span>
              </div>
              <div>
                <div className="bg-gray-200 py-1.5 px-3 rounded text-sm font-medium">
                  {dataSizes.ledger}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 text-sm text-gray-500 flex justify-start gap-3 items-center">
            <Clock8 className="text-gray-500" size={18} />
            <span>Estimated processing time: 5-10 minutes</span>
          </div>

          {isDownloading && (
            <div className="mt-5 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Generating PDF...</span>
                <span className="text-gray-600 font-semibold">{downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#188C43] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {downloadComplete && (
            <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="text-green-600" size={20} />
                <span className="text-green-800 font-semibold">Download Complete!</span>
              </div>
              <button
                onClick={handleOpenPdf}
                className="inline-flex items-center gap-2 bg-white border border-green-600 text-green-700 hover:bg-green-50 font-semibold rounded-md py-2 px-4 text-sm transition"
              >
                <ExternalLink size={16} />
                Open PDF
              </button>
            </div>
          )}

          <div className="mt-5">
            <button 
              onClick={handleDownloadData}
              disabled={isDownloading}
              className={`bg-[#188C43] hover:bg-[#156d35] text-white font-semibold rounded-md py-3 px-6 inline-flex items-center gap-2 transition ${
                isDownloading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download My Data
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border-[#EA2147] rounded-md border bg-white p-8">
          <div className="mb-6">
            <h2 className="font-extrabold text-xl text-[#EA2147]">
              Delete My Account
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Permanently delete your account and all associated data
            </p>
          </div>

          <div className="bg-[#FDE9ED] border border-[#EA2147] rounded-md p-5">
            <div className="flex gap-2 mb-2">
              <TriangleAlert className="text-[#EA2147] flex-shrink-0" />
              <h2 className="font-bold text-[#EA2147]">Warning</h2>
            </div>
            <p className="text-[#A61732] text-sm">
              This action cannot be undone. All your data will be permanently
              deleted and you will not be able to recover your account.
            </p>
          </div>

          <div className="mt-6">
            <h2 className="font-bold text-[#EA2147] text-lg mb-3">
              What will be deleted:
            </h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-1 text-sm">
              <li>Your profile and account information</li>
              <li>All uploaded files and content</li>
              <li>Activity history and preferences</li>
            </ul>
          </div>

          <div className="mt-6">
            <h2 className="font-bold text-lg mb-3">
              Before you delete your account:
            </h2>
            <ul className="list-disc ml-6 text-gray-600 text-sm">
              <li>Download your data if you want to keep a copy</li>
            </ul>
          </div>

          <div className="mt-6">
            <button 
              onClick={handleDeleteAccountClick}
              className="bg-[#EA2147] hover:bg-[#d41c3d] text-white font-extrabold tracking-wide rounded-md py-3 px-8 text-sm transition"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000]">
          {isDeleting ? (
            <div className="bg-white rounded-lg px-6 py-16 w-[300px] flex flex-col gap-6 items-center shadow-lg">
              <div className="loader"></div>
              <h2 className="text-base font-bold">Deleting Account...</h2>
            </div>
          ) : (
            <div className="bg-white rounded-lg px-6 py-5 w-[350px] flex flex-col gap-6 items-center shadow-lg">
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#EA2147] mb-2">Delete Account?</h2>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-between gap-4 w-full">
                <button
                  onClick={cancelDelete}
                  className="bg-white border border-[#979797] text-[#71717A] w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-[#EA2147] hover:bg-[#d41c3d] w-full text-white px-3 py-2 text-sm font-medium rounded-md transition"
                >
                  Yes, Delete!
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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

export default DeleteMyAccount;