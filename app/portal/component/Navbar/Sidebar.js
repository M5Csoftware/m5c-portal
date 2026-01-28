"use client";
import { useState, useContext, useEffect } from "react";
import React from "react";
import NavLink from "./NavLink";
import Image from "next/image";
import Link from "next/link";
import { GlobalContext } from "../../GlobalContext";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const Sidebar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [toggleTools, setToggleTools] = useState(false);
  const [toggleLogout, setToggleLogout] = useState(false);
  let { adding, setAdding, sidebarHovered, setSidebarHovered } =
    useContext(GlobalContext);

  // Sync activeTab with current URL on mount and URL changes
  useEffect(() => {
    if (pathname.includes("/shipments")) {
      setActiveTab("Shipments");
    } else if (pathname.includes("/reports")) {
      setActiveTab("Reports");
    } else if (pathname.includes("/address-book")) {
      setActiveTab("Address Book");
    } else if (pathname.includes("/account")) {
      setActiveTab("Account");
    } else if (pathname.includes("/tools")) {
      setActiveTab("Tools");
      setToggleTools(true); // Also expand tools menu if on a tools page
    } else if (pathname.includes("/customer-support")) {
      setActiveTab("Customer Support");
    } else if (pathname.includes("/settings")) {
      setActiveTab("Settings");
    } else if (pathname === "/portal" || pathname === "/portal/") {
      setActiveTab("Dashboard");
    }
  }, [pathname]);

  const handleOnClick = () => {
    setAdding((adding = false));
  };

  const handleLogoutClick = () => {
    setToggleLogout(!toggleLogout);
  };

  const confirmLogout = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      await signOut({ redirect: false }); // Prevent default redirection
      console.log("Logged out successfully");
      router.push("/"); // Manually redirect after logout
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoading(false); // Ensure loading state resets
    }
  };

  return (
    <nav
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
      className={`container  px-2 py-7  transition-all flex flex-col flex-shrink-0 justify-between  ${
        sidebarHovered ? "max-w-[200px]" : "max-w-[70px]"
      }`}
    >
      <div className="fixed bg-white flex flex-col justify-between  h-[95vh]">
        <div className="relative flex flex-col    gap-9">
          <Link href="/portal">
            <div className="relative px-2 flex gap-2 ">
              <Image
                width={24}
                height={22}
                src={"/logo.svg"}
                alt="M5C LOGISTICS"
              />
              <Image
                className={`${sidebarHovered ? "" : "hidden"}`}
                width={107}
                height={16}
                src={"/logoTxt.svg"}
                alt="M5C LOGISTICS"
              />
            </div>
          </Link>
          {!sidebarHovered && (
            <div
              className={`absolute top-9 rounded-full  bg-gradient-to-r from-white via-[#E2E8F0] to-white h-[1px] w-10`}
            >
              {" "}
            </div>
          )}
          <Image
            className={`absolute top-9 ${sidebarHovered ? "" : "hidden"}`}
            width={176}
            height={24}
            src={"/nav-logo-seperator.svg"}
            alt="Line"
          />
          <ul className="flex flex-col gap-1">
            <NavLink
              onClick={() => {}}
              href="../../portal"
              navLogo="/dashboard.svg"
              navAltTxt="Dashboard logo"
              navTitle="Dashboard"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <NavLink
              onClick={() => {}}
              href="../../portal/shipments"
              navLogo="/shipments.svg"
              navAltTxt="Shipments logo"
              navTitle="Shipments"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <NavLink
              onClick={() => {}}
              href="../../portal/reports"
              navLogo="/reports.svg"
              navAltTxt="Reports logo"
              navTitle="Reports"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <NavLink
              onClick={handleOnClick}
              href="../../portal/address-book"
              navLogo="/address-book.svg"
              navAltTxt="Address Book logo"
              navTitle="Address Book"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <NavLink
              onClick={() => {}}
              href="../../portal/account"
              navLogo="/account-ledger.svg"
              navAltTxt="Account ledger logo"
              navTitle="Account"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <NavLink
              onClick={() => {
                setToggleTools(!toggleTools);
              }}
              href="#"
              navLogo="/tools.svg"
              navAltTxt="Tools logo"
              navTitle="Tools"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                toggleTools & sidebarHovered
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-2 p-2">
                <NavLinkTool
                  onClick={() => {}}
                  href="../../portal/tools/rate-calculator"
                  navLogo="/cust-support.svg"
                  navAltTxt="cust-support logo"
                  navTitle="Rate Calculator"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <NavLinkTool
                  onClick={() => {}}
                  href="../../portal/tools/volume-weight"
                  navLogo="/cust-support.svg"
                  navAltTxt="cust-support logo"
                  navTitle="Volume Weight Calculator"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
            <NavLink
              onClick={() => {}}
              href="../../portal/customer-support"
              navLogo="/cust-support.svg"
              navAltTxt="cust-support logo"
              navTitle="Customer Support"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <div
              className={`relative overflow-hidden  h-[128px] flex   rounded-md transition-all  ${
                sidebarHovered
                  ? "max-w-44 max-h-32 bg-[var(--primary-color)]"
                  : "max-w-10 max-h-10"
              }`}
            >
              <div className={`flex flex-col gap-3 px-2 py-3`}>
                <div className="relative ">
                  <div className="w-6 h-6 z-[-1] rounded-lg flex justify-center items-center shadow-sm bg-white transition-transform duration-500"></div>
                  <Image
                    className="absolute top-[0.35rem] left-[0.35rem]"
                    src={"/question.svg"}
                    alt="Need Help?"
                    width={12}
                    height={12}
                  />
                </div>
                <div className={`text-white ${sidebarHovered ? "" : "hidden"}`}>
                  <p className="text-[11px] font-bold">Need help?</p>
                  <p className="text-[9px]">Please check our docs</p>
                  <Link
                    href="/documentation.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-white text-[#2D3748] text-[10px] font-semibold mt-2 w-full py-2 px-5 flex justify-center"
                  >
                    DOCUMENTATION
                  </Link>
                </div>
              </div>
            </div>
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <NavLink
            href="../../portal/settings"
            navLogo="/settings.svg"
            navAltTxt="Settings logo"
            navTitle="Settings"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <LogoutButton
            sidebarHovered={sidebarHovered}
            onClick={handleLogoutClick}
            href="#"
            navLogo="/log-out.svg"
            navAltTxt="Logout logo"
            navTitle="Logout"
          />
        </div>
      </div>

      {toggleLogout && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000]">
          {isLoading ? (
            <div className="bg-white rounded-lg px-6 py-16 w-[300px] flex flex-col gap-6  items-center shadow-lg">
              <div className="loader"></div>
              <h2 className="text-base font-bold ">Logging Out...</h2>
            </div>
          ) : (
            <div className="bg-white rounded-lg px-6 py-5 w-[300px] flex flex-col gap-9 items-center shadow-lg">
              <h2 className="text-xl font-bold">Logout from M5C Portal?</h2>
              <div className="flex justify-between gap-4 w-full ">
                <button
                  onClick={() => setToggleLogout(false)}
                  className="bg-white border border-[#979797] text-[#71717A] w-full px-3 py-2 text-sm font-medium rounded-md"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="bg-[var(--primary-color)] w-full text-white px-3 py-2 text-sm font-medium rounded-md"
                >
                  Yes, Logout!
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

const NavLinkTool = (props) => {
  return (
    <li onClick={props.onClick} className="list-none flex gap-2 flex-col ">
      <Link href={props.href}>
        <div className="text-[12px] border-2 rounded-lg px-2 py-1 text-[#A0AEC0] hover:bg-gray-100 transition-all">
          {props.navTitle}
        </div>
      </Link>
    </li>
  );
};
const LogoutButton = (props) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      onClick={props.onClick}
      className={`list-none flex gap-2 flex-col overflow-hidden h-10 transition-all ${
        props.sidebarHovered ? "max-w-44" : "max-w-10"
      }`}
    >
      <Link href={props.href}>
        <div
          className={` flex gap-2 justify-start items-center pl-2 py-2 rounded-md cursor-pointer transition-colors ease-in-out duration-150
              text-[#A0AEC0] hover:bg-[#EFF1F2] `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            setIsHovered(false);
          }}
        >
          <div className="relative">
            <div
              className="w-6 h-6 z-[-1] rounded-lg flex justify-center items-center shadow-sm bg-white transition-transform duration-500"
              style={{ transform: isHovered ? "" : "" }}
            />
            <Image
              className="absolute top-[0.35rem] left-[0.35rem]"
              src={props.navLogo}
              alt={props.navAltTxt}
              width={12}
              height={12}
            />
          </div>
          <div className="text-[12px] font-semibold">{props.navTitle}</div>
        </div>
      </Link>
    </li>
  );
};

export default Sidebar;
