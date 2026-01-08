import React, { useState } from 'react'

const ConsignorConsignee = () => {
  const [bgPos, setBgPos] = useState(false);
  return (
    <div className="w-[277px] h-[44] flex  border border-[#979797] rounded-full p-0.5 relative overflow-hidden mt-2">
      <div
        className={`transition-transform ${bgPos ? "translate-x-[8.5rem]" : ""
          } bg-[var(--primary-color)] w-[136px] h-11 absolute rounded-full -z-0`}
      ></div>
      <div
        onClick={() => setBgPos(false)}
        className={`flex items-center justify-center cursor-pointer  w-[136px] h-11 text-center   rounded-full  ${bgPos ? "text-[#979797]" : "text-white font-bold "
          }   text-xs z-0 transition-colors`}
      >
        Consignor
      </div>
      <div
        onClick={() => setBgPos(true)}
        className={`flex items-center justify-center cursor-pointer   w-[136px] h-11 text-center rounded-full ${bgPos ? "text-white font-bold " : "text-[#979797] "
          }  text-xs z-0 transition-colors`}
      >
        Consignee
      </div>
    </div>
  )
}

export default ConsignorConsignee;