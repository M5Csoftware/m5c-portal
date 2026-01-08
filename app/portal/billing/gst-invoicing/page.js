"use client";
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import CsbSetting from '../component/csb-setting'
import ViewInvoicing from '../component/ViewInvoicing'
import Form16Upload from '../component/Form16Upload'

const Page = () => {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const router = useRouter();

  // Map URL tab name → index
  const getInitialTab = () => {
    switch (tabParam) {
      case 'gst-invoicing': return 0;
      case 'csb-setting': return 1;
      case 'tds': return 2;
      default: return 0;
    }
  }

  const [selectedLi, setSelectedLi] = useState(getInitialTab());
  const [lineLeft, setLineLeft] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);
  const lineRef = useRef(null);

  // Update selected tab when URL changes
  useEffect(() => {
    setSelectedLi(getInitialTab());
  }, [tabParam]);

  // Slider animation (underline)
  useEffect(() => {
    const updateSlider = () => {
      const selectedElement = document.querySelector(`.billing-tabs li:nth-child(${selectedLi + 1})`);
      if (selectedElement) {
        setLineWidth(selectedElement.offsetWidth);
        setLineLeft(selectedElement.offsetLeft);
      }
    };

    const timer = setTimeout(updateSlider, 50);
    window.addEventListener('resize', updateSlider);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSlider);
    };
  }, [selectedLi]);

  const handleLiClick = (index) => {
    const tabNames = ["gst-invoicing", "csb-setting", "tds"];
    router.push(`?tab=${tabNames[index]}`);  // ← FIXED
  };

  // Render selected tab content
  const renderContent = () => {
    switch (selectedLi) {
      case 0: return <ViewInvoicing />;
      case 1: return <CsbSetting />;
      case 2: return <Form16Upload />;
      default: return <ViewInvoicing />;
    }
  };

  return (
    <main className="w-full px-9 pb-9 flex flex-col gap-7 relative">

      {/* Sticky Header */}
      <div className="flex flex-col gap-9 sticky top-[4.7rem] z-10 bg-[#F8F9FA] pt-4 pb-2">

        <h1 className="font-bold text-2xl text-[#18181B]">Billing</h1>

        {/* Tabs */}
        <div>
          <ul className="billing-tabs list-none flex gap-6 font-semibold">
            <li
              className={`cursor-pointer text-[14px] ${selectedLi === 0 ? 'text-[var(--primary-color)]' : 'text-[#A0AEC0]'
                }`}
              onClick={() => handleLiClick(0)}
            >
              View Invoicing
            </li>

            <li
              className={`cursor-pointer text-[14px] ${selectedLi === 1 ? 'text-[var(--primary-color)]' : 'text-[#A0AEC0]'
                }`}
              onClick={() => handleLiClick(1)}
            >
              CSBV Setting
            </li>

            <li
              className={`cursor-pointer text-[14px] ${selectedLi === 2 ? 'text-[var(--primary-color)]' : 'text-[#A0AEC0]'
                }`}
              onClick={() => handleLiClick(2)}
            >
              TDS Settings
            </li>
          </ul>

          {/* Slider underline */}
          <div className="relative mt-1">
            <Image
              layout="responsive"
              width={1000}
              height={24}
              src="/line-address.svg"
              alt="Line"
            />
            <div
              ref={lineRef}
              className="transition-all duration-300 absolute bottom-[1px] bg-[var(--primary-color)] rounded-t-xl"
              style={{ width: lineWidth, height: '3px', left: lineLeft }}
            />
          </div>
        </div>
      </div>

      {/* TAB CONTENT (FIXED) */}

      {renderContent()}

    </main>
  );
};

export default Page;
