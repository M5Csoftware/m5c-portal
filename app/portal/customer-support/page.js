"use client";

import { useState } from "react";
import Nav from "./Nav";
import RaiseTicket from "./RaiseTicket";
import Tickets from "./Tickets";
import FilterCustomerSupport from "./FilterCustomerSupport";
import FAQs from "./FAQs";

const Page = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLi, setSelectedLi] = useState(0); // Declare selectedLi state

  return (
    <main className="w-full px-9 flex flex-col gap-6 relative">
      <h1 className="font-bold text-2xl text-[#18181B]">Customer Support</h1>
      {/* Pass setSelectedLi and selectedLi to Nav */}
      <Nav
        onStatusChange={setStatusFilter}
        selectedLi={selectedLi}
        onLiChange={setSelectedLi}
      />
      {selectedLi == 0 ? (
        <div>
          <Tickets statusFilter={statusFilter} />
          <div className="bg-white shadow-lg rounded-lg z-[100] fixed top-0 bottom-0 right-0">
            <RaiseTicket />
          </div>
          <div className="bg-white shadow-lg rounded-lg z-[100] fixed top-0 bottom-0 right-0">
            <FilterCustomerSupport />
          </div>
        </div>
      ) : (
        <FAQs />
      )}
    </main>
  );
};

export default Page;
