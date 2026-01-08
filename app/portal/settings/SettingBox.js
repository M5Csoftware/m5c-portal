"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function SettingBox(props) {
  return (
    <div className="h-[227px] w-[325px] border border-[#E2E8F0] rounded-[10px] p-5 flex gap-2">
      <div>
        <Image src={props.logo} alt="" width={24} height={24} />
      </div>
      <div className="w-full flex flex-col gap-[14px]">
        <div>
          <h2 className="text-base text-[#2D3748] font-medium">
            {props.label}
          </h2>
        </div>
        <div className="flex flex-col pr-12">
          <SettingTabs settingList={props.settingList} />
        </div>
      </div>
    </div>
  );
}

function SettingTabs({ settingList }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const router = useRouter();

  const handleClick = (e, link, name) => {
    e.preventDefault();
    console.log("Clicked:", name);
    console.log("Navigating to:", link);
    router.push(link);
  };

  return (
    <div className="flex flex-col gap-1">
      {settingList.map((item, index) => (
        <div
          key={index}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={(e) => handleClick(e, item.link, item.name)}
          className="flex justify-between items-center transition-all cursor-pointer py-1 hover:bg-gray-50 px-2 rounded"
        >
          <h3
            className={`text-[#52525B] text-xs ${
              hoveredIndex === index ? "underline text-[#E33357]" : ""
            } transition-all`}
          >
            {item.name}
          </h3>
          <Image
            src="/settings/right-arrow.svg"
            alt=""
            width={12}
            height={12}
            className={`transition-transform ${
              hoveredIndex === index ? "translate-x-1" : ""
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default SettingBox;