'use client'
import React, { useContext, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GlobalContext } from '../../GlobalContext';

const NavLink = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = props.navTitle === props.activeTab;
  let { sidebarHovered } = useContext(GlobalContext);

  // console.log(props.href)

  return (
    <li onClick={props.onClick} className= {`list-none flex gap-2 flex-col overflow-hidden h-10 transition-all ${sidebarHovered ? 'max-w-44' : 'max-w-10'}`}>
      <Link href={props.href}>
        <div
          className={` flex gap-2 justify-start items-center pl-2 py-2 rounded-md cursor-pointer transition-colors ease-in-out duration-150
            ${isActive ? 'text-white bg-[var(--primary-color)]' : 'text-[#A0AEC0] hover:bg-[#EFF1F2] '}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => { setIsHovered(false); props.setActiveTab(props.navTitle) }}
        >
          <div className='relative'>
            <div
              className="w-6 h-6 z-[-1] rounded-lg flex justify-center items-center shadow-sm bg-white transition-transform duration-500"
              style={{ transform: isHovered && !isActive ? '' : '' }}
            />
            <Image className='absolute top-[0.35rem] left-[0.35rem]' src={props.navLogo} alt={props.navAltTxt} width={12} height={12} />
          </div>
          <div className={`text-[12px] font-semibold text-nowrap`}>
            {props.navTitle}
          </div>
        </div>
      </Link>
    </li>
  );
};

export default NavLink;
