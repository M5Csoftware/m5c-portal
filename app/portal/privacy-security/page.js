"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import DeleteMyAccount from "./component/DeleteMyAccount";
import { CookieSettings } from "./component/CookieSettings";
import ComplianceCenter from "./component/ComplianceCenter";
import DataPrivacySecurity from "./component/DataPrivacySecurity";

export default function PrivacySecurityPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [selectedLi, setSelectedLi] = useState(0);
  const [lineLeft, setLineLeft] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);
  const lineRef = useRef(null);

  const tabs = [
    { id: "password", label: "Data Privacy & Security" },
    { id: "compliance", label: "Compliance Center" },
    { id: "cookie", label: "Cookie Setting" },
    { id: "delete", label: "Delete my Account" },
  ];

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl) {
      const index = tabs.findIndex(tab => tab.id === tabFromUrl);
      if (index !== -1) {
        setSelectedLi(index);
      }
    }
  }, [tabFromUrl]);

  // Update line position when active tab changes
  useEffect(() => {
    if (lineRef.current) {
      const selectedElement = document.querySelector(`.list-none > li:nth-child(${selectedLi + 1})`);
      if (selectedElement) {
        const ulElement = selectedElement.parentElement;
        setLineWidth(selectedElement.offsetWidth);
        setLineLeft(selectedElement.offsetLeft - ulElement.offsetLeft);
      }
    }
  }, [selectedLi]);

  const handleLiClick = (index) => {
    setSelectedLi(index);
  };

  const renderContent = () => {
    switch (selectedLi) {
      case 0:
        return <DataPrivacySecurity />;
      case 1:
        return <ComplianceCenter />;
      case 2:
        return <CookieSettings />;
      case 3:
        return <DeleteMyAccount />;
      default:
        return <DataPrivacySecurity />;
    }
  };

  return (
    <main className='w-full h-screen overflow-y-auto px-9 pb-9 flex flex-col gap-9 relative'>
      <div className='flex flex-col gap-9 sticky top-0 z-10 bg-[#f8f9fa] pt-2'>
        <h1 className='font-bold text-2xl text-[#18181B] py-2 bg-[#F8F9FA]'>Privacy & Security</h1>
        <div>
          <ul className='list-none flex gap-6 font-semibold'>
            {tabs.map((tab, index) => (
              <li 
                key={tab.id}
                style={{ cursor: 'pointer', fontSize: '14px' }} 
                className={selectedLi === index ? 'text-[var(--primary-color)]' : 'text-[#A0AEC0]'} 
                onClick={() => handleLiClick(index)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
          <div className="relative mt-1">
            <Image layout='responsive' width={1000} height={24} src={'/line-address.svg'} alt='Line' />
            <div ref={lineRef} className="transition-all duration-400 rounded-t-lg absolute bottom-[1px] bg-[var(--primary-color)]" style={{ width: lineWidth, height: '3px', left: lineLeft }}></div>
          </div>
        </div>
      </div>
      <div className='pr-1'>
        {renderContent()}
      </div>
    </main>
  );
}