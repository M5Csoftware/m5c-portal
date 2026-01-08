"use client";
import { useContext } from "react";
import Account from "./Account";

const Page = () => {
  return (
    <main className="w-full px-9 flex flex-col gap-6">
      <h1 className="font-bold text-2xl text-[#18181B]">Account Ledger</h1>
      <Account />
    </main>
  );
};

export default Page;
