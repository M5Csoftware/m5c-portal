"use client";
import React, { useState, useRef, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlobalContext } from "../../GlobalContext";
import NotificationModal from "./NotificationModal";
import AwbInput from "@/app/components/AwbInput";
import { useSession } from "next-auth/react";
import axios from "axios";

const QuickActionButton = ({ name, imageName }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="rounded-lg bg-white w-[115px] h-[90px] p-2 hover:bg-[var(--primary-color)] text-[var(--primary-color)] transition-all hover:text-white cursor-pointer flex flex-col items-center justify-around shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        width={32}
        height={32}
        src={`/quick-action/${imageName}${isHovered ? "-hover" : ""}.svg`}
        alt={name}
      />
      <span className="text-xs">{name}</span>
    </div>
  );
};

// Enhanced sidebar items with icons and descriptions
const sidebarItems = [
  {
    title: "Dashboard",
    route: "/portal",
    category: "Main",
    icon: "/dashboard.svg",
    description: "Overview and analytics"
  },
  {
    title: "Shipments",
    route: "/portal/shipments",
    category: "Main",
    icon: "/shipments.svg",
    description: "Manage all shipments"
  },
  {
    title: "Reports",
    route: "/portal/reports",
    category: "Main",
    icon: "/reports.svg",
    description: "View reports and analytics"
  },
  {
    title: "Address Book",
    route: "/portal/address-book",
    category: "Main",
    icon: "/address-book.svg",
    description: "Manage saved addresses"
  },
  {
    title: "Account",
    route: "/portal/account",
    category: "Main",
    icon: "/account-ledger.svg",
    description: "Account ledger and balance"
  },
  {
    title: "Tools",
    route: "#",
    category: "Main",
    icon: "/tools.svg",
    description: "Various utility tools"
  },
  {
    title: "Rate Calculator",
    route: "/portal/tools/rate-calculator",
    category: "Tools",
    icon: "/cust-support.svg",
    description: "Calculate shipping rates"
  },
  {
    title: "Volume Weight Calculator",
    route: "/portal/tools/volume-weight",
    category: "Tools",
    icon: "/cust-support.svg",
    description: "Calculate volume weight"
  },
  {
    title: "Customer Support",
    route: "/portal/customer-support",
    category: "Main",
    icon: "/cust-support.svg",
    description: "Get help and support"
  },
  {
    title: "Settings",
    route: "/portal/settings",
    category: "Main",
    icon: "/settings.svg",
    description: "Account settings"
  },
];

const SearchModal = ({ isOpen, onClose, searchTerm, onItemSelect }) => {
  const modalRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemsRef = useRef([]);

  // Filter items based on search term
  const filteredItems = sidebarItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by first letter
  const groupedItems = filteredItems.reduce((acc, item) => {
    const firstLetter = item.title.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(item);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedItems).sort();

  // Flatten items for keyboard navigation
  const flatItems = sortedLetters.flatMap(letter => groupedItems[letter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setSelectedIndex(0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, searchTerm]);

  useEffect(() => {
    if (itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < flatItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : flatItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          handleItemClick(flatItems[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleItemClick = (item) => {
    onItemSelect(item);
    onClose();
    setSelectedIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-center pt-20 px-4">
        <div
          ref={modalRef}
          className="bg-white rounded-xl w-full max-w-4xl max-h-[70vh] overflow-hidden shadow-2xl border border-gray-200"
        >
          {/* Search Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Search Portal
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Image width={20} height={20} src="/close-button.svg" alt="Close" />
              </button>
            </div>

            {/* Search Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{filteredItems.length} results found</span>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Image
                    width={40}
                    height={40}
                    src="/search-not-found.svg"
                    alt="No results"
                    className="opacity-50"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  No results found
                </h4>
                <p className="text-gray-500 text-sm">
                  Try searching for &quot;Dashboard&quot;, &quot;Shipments&quot;, &quot;Reports&quot;, or other section names
                </p>
              </div>
            ) : (
              <div className="p-6">
                {sortedLetters.map((letter, letterIndex) => (
                  <div key={letter} className="mb-8 last:mb-0">
                    {/* Letter Header */}
                    <div className="flex items-center gap-4 mb-4 pb-2 border-b border-gray-100">
                      <div className="flex items-center justify-center w-10 h-10 bg-[var(--primary-color)] text-white rounded-lg font-bold text-lg">
                        {letter}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {letter} Section
                        </h4>
                        <p className="text-sm text-gray-500">
                          {groupedItems[letter].length} item(s) found
                        </p>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-14">
                      {groupedItems[letter].map((item, itemIndex) => {
                        const flatIndex = sortedLetters
                          .slice(0, letterIndex)
                          .reduce((acc, l) => acc + groupedItems[l].length, 0) + itemIndex;

                        const isSelected = flatIndex === selectedIndex;

                        return (
                          <div
                            key={`${letter}-${itemIndex}`}
                            ref={el => itemsRef.current[flatIndex] = el}
                            onClick={() => handleItemClick(item)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${isSelected
                              ? 'border-[var(--primary-color)] bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-[var(--primary-color)] hover:bg-blue-50'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${isSelected
                                ? 'bg-[var(--primary-color)]'
                                : 'bg-gray-200'
                                } transition-colors`}>
                                <Image
                                  width={16}
                                  height={16}
                                  src={item.icon}
                                  alt={item.title}
                                  className={`${isSelected ? 'filter brightness-0 invert' : ''
                                    }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className={`font-semibold truncate ${isSelected ? 'text-[var(--primary-color)]' : 'text-gray-800'
                                    }`}>
                                    {item.title}
                                  </h5>
                                  {item.category === "Tools" && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                      Tool
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {item.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-500 capitalize">
                                    {item.category}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-blue-600 font-medium">
                                    Click to navigate
                                  </span>
                                </div>
                              </div>
                              <Image
                                width={16}
                                height={16}
                                src="/arrow-right.svg"
                                alt="Go"
                                className={`opacity-0 transition-opacity ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'
                                  }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredItems.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>M5C Logistics Portal Search</span>
                <span>Press Esc To Close</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);
};

const Navbar = () => {
  const [isQuickActionActive, setIsQuickActionActive] = useState(false);
  const [isWalletHovered, setIsWalletHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAwbInput, setShowAwbInput] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [creditLimit, setCreditLimit] = useState(50000);
  const [m5coins, setM5coins] = useState(500);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const { setWalletOpen, accountCode, server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const router = useRouter();

  // Get accountCode from session if not in GlobalContext
  const finalAccountCode = accountCode || session?.user?.accountCode || session?.user?.email;

  // Track if balance has been fetched
  const balanceFetchedRef = useRef(false);
  const isRefreshingRef = useRef(false);

  // Fetch balance function
  const fetchBalance = async () => {
    if (!finalAccountCode || !server) {
      console.error('No account code or server available');
      setBalanceLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isRefreshingRef.current) {
      console.log('Balance fetch already in progress, skipping...');
      return;
    }

    try {
      isRefreshingRef.current = true;
      setBalanceLoading(true);
      console.log('Fetching balance from:', `${server}/payment/balance?accountCode=${finalAccountCode}`);
      
      const response = await axios.get(
        `${server}/payment/balance?accountCode=${finalAccountCode}`
      );
      
      console.log('Balance response:', response.data);
      
      if (response.data.success) {
        setBalance(response.data.balance || 0);
        balanceFetchedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    } finally {
      setBalanceLoading(false);
      isRefreshingRef.current = false;
    }
  };

  // Initial balance fetch - only once
  useEffect(() => {
    if (finalAccountCode && server && !balanceFetchedRef.current) {
      fetchBalance();
    }
  }, [finalAccountCode, server]);

  // Listen for payment success event only
  useEffect(() => {
    const handlePaymentSuccess = () => {
      console.log('Payment success event received, refreshing balance...');
      setTimeout(() => {
        fetchBalance();
      }, 1000); // Small delay to ensure backend has updated
    };

    // Listen for custom event
    window.addEventListener('paymentSuccess', handlePaymentSuccess);

    // Listen for storage event (for cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === 'paymentSuccess') {
        setTimeout(() => {
          fetchBalance();
        }, 1000);
        localStorage.removeItem('paymentSuccess');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [finalAccountCode, server]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsQuickActionActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSearchFocused && searchTerm.length > 0) {
      setShowSearchModal(true);
    }
  }, [searchTerm, isSearchFocused]);

  const handleSearchItemSelect = (item) => {
    if (item.route && item.route !== "#") {
      router.push(item.route);
      setSearchTerm("");
      setShowSearchModal(false);
      setIsSearchFocused(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowSearchModal(true);
    } else if (e.key === "Escape") {
      setShowSearchModal(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!showSearchModal) {
        setIsSearchFocused(false);
      }
    }, 2000);
  };

  return (
    <div className="py-5 w-full font-semibold text-[#2D3748]">
      <div className="flex items-center gap-6 pr-8 relative justify-end">
        {/* Quick Action Button */}
        <div className="relative">
          <button
            className={`cursor-pointer px-4 py-2.5 flex gap-2 text-sm ${isQuickActionActive
              ? "text-white bg-[var(--primary-color)]"
              : "bg-[#E2E8F0] hover:bg-[#dbe3ee]"
              } transition-all rounded-lg flex items-center`}
            onClick={() => setIsQuickActionActive(!isQuickActionActive)}
          >
            <Image
              width={18}
              height={18}
              src="/quick_action.svg"
              alt="Quick Action"
            />
            <span>Quick Action</span>
          </button>
          {isQuickActionActive && (
            <div
              ref={dropdownRef}
              className="absolute w-fit p-4 rounded-xl z-50 bg-[#dbe3ee] shadow-lg border border-gray-200 top-14 -left-52 flex gap-4"
            >
              <Link href="../../portal/createshipment">
                <QuickActionButton
                  name="Create Shipment"
                  imageName="qa-create-shipment"
                />
              </Link>
              <Link href="../../portal/customer-support">
                <QuickActionButton
                  name="Raise Ticket"
                  imageName="qa-raise-ticket"
                />
              </Link>
              <Link href="../../portal/tools/rate-calculator">
                <QuickActionButton
                  name="Rate Calculator"
                  imageName="qa-rate-calculator"
                />
              </Link>
              <div onClick={() => setShowAwbInput(true)}>
                <QuickActionButton
                  name="Track Shipment"
                  imageName="qa-track-shipment"
                />
              </div>
            </div>
          )}
        </div>

        {/* Wallet */}
        <div
          onMouseEnter={() => setIsWalletHovered(true)}
          onMouseLeave={() => setIsWalletHovered(false)}
          className="cursor-pointer px-4 py-2.5 text-sm bg-[#E2E8F0] rounded-lg gap-3 flex items-center relative"
        >
          <Image width={18} height={18} src="/wallet.svg" alt="Wallet" />
          <span>
            {balanceLoading ? (
              <span className="text-gray-500">Loading...</span>
            ) : (
              `${formatCurrency(balance)} INR`
            )}
          </span>
          <button
            onClick={() => setWalletOpen(true)}
            className="hover:bg-gray-200 rounded p-1 transition-colors"
          >
            <Image
              width={16}
              height={16}
              src="/wallet_addTo.svg"
              alt="Add Funds"
            />
          </button>
          {isWalletHovered && (
            <div className="absolute -left-[3px] top-12 rounded-xl border border-[var(--primary-color)] shadow-lg bg-white px-4 py-3 flex flex-col gap-3 min-w-44 z-50">
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-[var(--primary-color)] rounded-full flex items-center justify-center flex-shrink-0">
                  <Image
                    width={12}
                    height={12}
                    src="/wallet_white.svg"
                    alt="Wallet"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Balance</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {balanceLoading ? 'Loading...' : `₹${formatCurrency(balance)}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-[var(--primary-color)] rounded-full flex items-center justify-center flex-shrink-0">
                  <Image
                    width={12}
                    height={12}
                    src="/wallet_white.svg"
                    alt="Credit"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Credit Limit</p>
                  <p className="text-sm font-semibold text-gray-800">₹{formatCurrency(creditLimit)}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-[var(--primary-color)] rounded-full flex items-center justify-center flex-shrink-0">
                  <Image
                    width={12}
                    height={12}
                    src="/wallet_white.svg"
                    alt="Coins"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600">M5Coins</p>
                  <p className="text-sm font-semibold text-gray-800">{m5coins}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Search Input */}
        <div className="relative flex">
          <div className={`flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${isSearchFocused ? 'border-[var(--primary-color)] shadow-lg' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <Image
              width={20}
              height={20}
              src="/search_action.svg"
              alt="Search"
              className="text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-[#2D3748] w-full placeholder-gray-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={handleSearchBlur}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="hover:bg-gray-100 rounded transition-colors"
              >
                <Image width={15} height={15} src="/close-button.svg" alt="Clear" />
              </button>
            )}
          </div>

          {/* Enhanced Search Modal */}
          <SearchModal
            isOpen={showSearchModal}
            onClose={() => setShowSearchModal(false)}
            searchTerm={searchTerm}
            onItemSelect={handleSearchItemSelect}
          />
        </div>

        {/* Notification and Profile */}
        <div className="flex gap-2 items-center">
          <NotificationModal />
          <Link
            href="../../portal/profile"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Image width={24} height={24} src="/profile.svg" alt="Profile" />
          </Link>
        </div>
      </div>

      {/* AWB Input Modal */}
      {showAwbInput && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowAwbInput(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <AwbInput
              onClose={() => setShowAwbInput(false)}
              setIsQuickActionActive={setIsQuickActionActive}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;