'use client'
import React, { useEffect, useRef, useState } from 'react'
import ProfilePage from './Profile'
import Image from 'next/image'
import KYC from './KYC'
import ChangePassword from './ChangePassword'

const Page = () => {
  const [selectedLi, setSelectedLi] = useState(0);
  const [lineLeft, setLineLeft] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);
  const lineRef = useRef(null);

  useEffect(() => {
    if (lineRef.current) {
      const selectedElement = document.querySelector(`.list-none > li:nth-child(${selectedLi + 1})`);
      if (selectedElement) {
        const ulElement = selectedElement.parentElement;
        setLineWidth(selectedElement.offsetWidth);
        setLineLeft(selectedElement.offsetLeft - ulElement.offsetLeft); // Compute offset relative to ul
      }
    }
  }, [selectedLi]);

  const handleLiClick = (index) => {
    setSelectedLi(index);
  }

  const renderContent = () => {
    switch (selectedLi) {
      case 0:
        return <ProfilePage />;
      case 1:
        return <KYC />;
      case 2:
        return <ChangePassword />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <main className='w-full px-9 pb-9 flex flex-col gap-9 relative'>
      <div className='flex flex-col gap-9 sticky top-[4.7rem] z-10 bg-[#f8f9fa]'>
        <h1 className='font-bold text-2xl text-[#18181B] py-2 sticky top-[76px] bg-[#F8F9FA] z-40'>Company</h1>
        <div>
          <ul className='list-none flex gap-6 font-semibold'>
            <li style={{ cursor: 'pointer', fontSize: '14px' }} className={selectedLi === 0 ? 'text-[var(--primary-color)] ' : 'text-[#A0AEC0]'} onClick={() => handleLiClick(0)}>Company Profile</li>
            <li style={{ cursor: 'pointer', fontSize: '14px' }} className={selectedLi === 1 ? 'text-[var(--primary-color)]' : 'text-[#A0AEC0]'} onClick={() => handleLiClick(1)}>KYC</li>
            <li style={{ cursor: 'pointer', fontSize: '14px' }} className={selectedLi === 2 ? 'text-[var(--primary-color)]' : 'text-[#A0AEC0]'} onClick={() => handleLiClick(2)}>Change Password</li>
          </ul>
          <div className="relative mt-1 ">
            <Image layout='responsive' width={1000} height={24} src={'/line-address.svg'} alt='Line' />
            <div ref={lineRef} className="transition-all duration-400 rounded-t-lg absolute bottom-[1px] bg-[var(--primary-color)]" style={{ width: lineWidth, height: '3px', left: lineLeft }}></div>
          </div>
        </div>
      </div>
      <div className='pr-1'>

      {renderContent()}
      </div>
    </main>
  )
}

export default Page;
