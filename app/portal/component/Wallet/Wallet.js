// "use client";
// import React, { useContext, useState, useEffect } from "react";
// import Image from "next/image";
// import { GlobalContext } from "../../GlobalContext";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { useSession } from "next-auth/react";

// // Helper function to format number in Indian currency format
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat("en-IN", {
//     style: "decimal",
//     maximumFractionDigits: 0,
//   }).format(amount);
// };

// function Wallet() {
//   const { setWalletOpen, accountCode, server } = useContext(GlobalContext);
//   const { data: session } = useSession();
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors, isValid },
//   } = useForm({
//     mode: "onChange",
//   });

//   const [showCheckout, setShowCheckout] = useState(false);
//   const [checkoutData, setCheckoutData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [balance, setBalance] = useState(0);
//   const [balanceLoading, setBalanceLoading] = useState(true);

//   // Get accountCode from session if not in GlobalContext
//   const finalAccountCode =
//     accountCode || session?.user?.accountCode || session?.user?.email;

//   console.log("Wallet Debug:", {
//     accountCode,
//     sessionAccountCode: session?.user?.accountCode,
//     sessionEmail: session?.user?.email,
//     finalAccountCode,
//     server,
//   });

//   // Fetch current balance
//   const fetchBalance = async () => {
//     if (!finalAccountCode) {
//       console.error("No account code available");
//       setBalanceLoading(false);
//       return;
//     }

//     try {
//       setBalanceLoading(true);
//       console.log(
//         "Fetching balance from:",
//         `${server}/payment/balance?accountCode=${finalAccountCode}`
//       );

//       const response = await axios.get(
//         `${server}/payment/balance?accountCode=${finalAccountCode}`
//       );

//       console.log("Balance response:", response.data);

//       if (response.data.success) {
//         setBalance(response.data.balance || 0);
//       }
//     } catch (error) {
//       console.error("Error fetching balance:", error);
//       console.error("Error details:", error.response?.data);
//       setBalance(0);
//     } finally {
//       setBalanceLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (finalAccountCode && server) {
//       fetchBalance();
//     }
//   }, [finalAccountCode, server]);

//   // Check for payment success in URL (after redirect from PayU)
//   useEffect(() => {
//     const checkPaymentStatus = () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const paymentSuccess = urlParams.get("payment");

//       if (paymentSuccess === "success") {
//         console.log("Payment successful, triggering balance refresh");

//         // Dispatch custom event for balance refresh
//         window.dispatchEvent(new Event("paymentSuccess"));

//         // Also use localStorage for cross-tab communication
//         localStorage.setItem("paymentSuccess", Date.now().toString());

//         // Refresh balance in this component
//         fetchBalance();

//         // Clean up URL
//         window.history.replaceState(
//           {},
//           document.title,
//           window.location.pathname
//         );
//       }
//     };

//     checkPaymentStatus();
//   }, []);

//   const onSubmit = async (data) => {
//     if (!finalAccountCode) {
//       alert("Account code is not available. Please login again.");
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log("Submitting payment with:", {
//         amount: parseFloat(data.amount),
//         accountCode: finalAccountCode,
//       });

//       const response = await axios.post(`${server}/payment/initiate`, {
//         amount: parseFloat(data.amount),
//         accountCode: finalAccountCode,
//       });

//       console.log("Payment response:", response.data);

//       if (response.data.success) {
//         setCheckoutData(response.data);
//         setShowCheckout(true);
//       }
//     } catch (error) {
//       console.error("Error initiating payment:", error);
//       console.error("Error details:", error.response?.data);
//       alert(
//         `Failed to initiate payment: ${
//           error.response?.data?.error || error.message
//         }`
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = () => {
//     if (!checkoutData) return;

//     console.log("Checkout data:", checkoutData);

//     // Create a form and submit it to PayU
//     const form = document.createElement("form");
//     form.method = "POST";
//     form.action = checkoutData.paymentData.payuUrl;

//     // IMPORTANT: Use surl and furl from backend response
//     const params = {
//       key: checkoutData.paymentData.key,
//       txnid: checkoutData.paymentData.txnid,
//       amount: checkoutData.paymentData.amount,
//       productinfo: checkoutData.paymentData.productinfo,
//       firstname: checkoutData.paymentData.firstname,
//       email: checkoutData.paymentData.email,
//       phone: checkoutData.paymentData.phone,
//       surl: `${server}/payment/success`,  // From backend
//       furl: `${server}/payment/success`,  // From backend
//       hash: checkoutData.paymentData.hash,
//       udf1: checkoutData.paymentData.accountCode,
//     };

//     console.log("Payment form data:", params);
//     console.log("Submitting to PayU URL:", form.action);

//     Object.keys(params).forEach((key) => {
//       const input = document.createElement("input");
//       input.type = "hidden";
//       input.name = key;
//       input.value = params[key];
//       form.appendChild(input);
//     });

//     document.body.appendChild(form);
//     form.submit();
//   };

//   // Watch the 'amount' input field
//   const amount = watch("amount", "");

//   const handleInputChange = (e) => {
//     const rawValue = e.target.value.replace(/,/g, "");
//     if (rawValue === "") {
//       setValue("amount", "", { shouldValidate: true, shouldDirty: true });
//     } else if (!isNaN(rawValue) && /^[0-9]*$/.test(rawValue)) {
//       setValue("amount", rawValue, { shouldValidate: true, shouldDirty: true });
//     } else {
//       setValue("amount", amount, { shouldValidate: true, shouldDirty: true });
//     }
//   };

//   const handleBlur = () => {
//     const parsedAmount = parseFloat(
//       (amount || "").toString().replace(/,/g, "")
//     );
//     if (!isNaN(parsedAmount)) {
//       setValue("amount", parsedAmount.toString(), { shouldValidate: true });
//     } else {
//       setValue("amount", "", { shouldValidate: true });
//     }
//   };

//   const formattedAmount = amount ? formatCurrency(amount) : "";

//   // Show error if no account code
//   if (!finalAccountCode) {
//     return (
//       <div
//         className="flex flex-col gap-6 text-[#18181B] bg-white rounded-xl shadow-xl px-9 py-6 relative"
//         data-wallet-modal
//       >
//         <div>
//           <div className="flex w-full items-center justify-between">
//             <span className="text-xl mb-3">Recharge Wallet</span>
//             <button onClick={() => setWalletOpen(false)}>
//               <Image
//                 src={`/close-button.svg`}
//                 width={24}
//                 height={24}
//                 alt="close"
//               />
//             </button>
//           </div>
//           <hr className="absolute left-0 right-0 text-[#E2E8F0] border-t-2 border-[#e2e8f0]" />
//         </div>
//         <div className="text-center py-8">
//           <p className="text-red-600 mb-4">
//             Account information not available.
//           </p>
//           <p className="text-gray-600 text-sm">
//             Please login again or contact support.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (showCheckout && checkoutData) {
//     return (
//       <div
//         className="flex flex-col gap-6 text-[#18181B] bg-white rounded-xl shadow-xl px-9 py-6 relative max-w-2xl"
//         data-wallet-modal
//       >
//         <div>
//           <div className="flex w-full items-center justify-between mb-3">
//             <span className="text-xl font-semibold text-yellow-600">
//               Check out
//             </span>
//             <button onClick={() => setWalletOpen(false)}>
//               <Image
//                 src={`/close-button.svg`}
//                 width={24}
//                 height={24}
//                 alt="close"
//               />
//             </button>
//           </div>
//           <hr className="border-t-2 border-[#e2e8f0]" />
//         </div>

//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Check Out</h3>

//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div className="font-medium">Order Id</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.orderId}
//             </div>

//             <div className="font-medium">Amount</div>
//             <div className="text-gray-700">
//               ₹ {formatCurrency(checkoutData.checkoutData.amount)}
//             </div>

//             <div className="col-span-2 font-semibold mt-2">
//               Billing information:
//             </div>

//             <div className="font-medium">Billing Name</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.billingName}
//             </div>

//             <div className="font-medium">Billing Address:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.billingAddress}
//             </div>

//             <div className="font-medium">Billing City:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.billingCity}
//             </div>

//             <div className="font-medium">Billing State:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.billingState}
//             </div>

//             <div className="font-medium">Billing Zip:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.billingZip}
//             </div>

//             <div className="font-medium">Billing Country:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.billingCountry}
//             </div>

//             <div className="font-medium">Billing Tel:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.billingTel}
//             </div>

//             <div className="font-medium">Billing Email:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.billingEmail}
//             </div>

//             <div className="font-medium">Customer Id:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.customerId}
//             </div>

//             <div className="font-medium">Customer Name:</div>
//             <div className="text-gray-700">
//               {checkoutData.checkoutData.customerName}
//             </div>
//           </div>

//           <button
//             onClick={handlePayment}
//             className="w-full bg-[var(--primary-color)] text-white text-sm py-3.5 rounded-md hover:opacity-90 transition-opacity mt-4"
//           >
//             Checkout
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="flex flex-col gap-9 text-[#18181B] bg-white rounded-xl shadow-xl px-9 py-6 relative"
//       data-wallet-modal
//     >
//       <div>
//         <div className="flex w-full items-center justify-between">
//           <div>
//             <span className="text-xl mb-3">Recharge Wallet</span>
//             <div className="text-sm text-gray-600 mt-2">
//               Current Balance:{" "}
//               {balanceLoading ? (
//                 <span className="text-gray-500">Loading...</span>
//               ) : (
//                 <span className="font-semibold text-green-600">
//                   ₹ {formatCurrency(balance)}
//                 </span>
//               )}
//             </div>
//           </div>
//           <button onClick={() => setWalletOpen(false)}>
//             <Image
//               src={`/close-button.svg`}
//               width={24}
//               height={24}
//               alt="close"
//             />
//           </button>
//         </div>
//         <hr className="absolute left-0 right-0 text-[#E2E8F0] border-t-2 border-[#e2e8f0]" />
//       </div>
//       <div>
//         <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-9">
//           <div className="flex flex-col gap-4">
//             <label htmlFor="amount">Enter Amount</label>

//             <div className="relative">
//               <span
//                 className={`absolute left-6 top-1/2 transform -translate-y-1/2 transition-colors ${
//                   amount ? "" : "text-[#979797]"
//                 }`}
//               >
//                 ₹
//               </span>
//               <input
//                 {...register("amount", {
//                   required: "Amount is required",
//                   pattern: {
//                     value: /^[0-9]+$/i,
//                     message: "Only numbers are allowed",
//                   },
//                   validate: (value) => {
//                     const num = parseFloat(value);
//                     if (isNaN(num) || num <= 0)
//                       return "Amount must be greater than 0";
//                     return true;
//                   },
//                 })}
//                 type="text"
//                 onChange={handleInputChange}
//                 onBlur={handleBlur}
//                 id="amount"
//                 placeholder="5000"
//                 className={`pl-10 border rounded px-6 py-2.5 outline-none w-full ${
//                   errors.amount ? "border-red-500" : "border-[#979797]"
//                 }`}
//                 value={formattedAmount}
//               />
//             </div>
//             {errors.amount && (
//               <span className="text-red-500 text-sm">
//                 {errors.amount.message}
//               </span>
//             )}

//             <ul className="flex gap-4">
//               <li
//                 onClick={() =>
//                   setValue("amount", "10000", { shouldValidate: true })
//                 }
//                 className="cursor-pointer rounded-3xl border border-[#979797] py-1.5 px-3.5 w-fit hover:bg-gray-50"
//               >
//                 ₹ 10,000
//               </li>
//               <li
//                 onClick={() =>
//                   setValue("amount", "50000", { shouldValidate: true })
//                 }
//                 className="cursor-pointer rounded-3xl border border-[#979797] py-1.5 px-3.5 w-fit hover:bg-gray-50"
//               >
//                 ₹ 50,000
//               </li>
//               <li
//                 onClick={() =>
//                   setValue("amount", "100000", { shouldValidate: true })
//                 }
//                 className="cursor-pointer rounded-3xl border border-[#979797] py-1.5 px-3.5 w-fit hover:bg-gray-50"
//               >
//                 ₹ 1,00,000
//               </li>
//               <li
//                 onClick={() =>
//                   setValue("amount", "150000", { shouldValidate: true })
//                 }
//                 className="cursor-pointer rounded-3xl border border-[#979797] py-1.5 px-3.5 w-fit hover:bg-gray-50"
//               >
//                 ₹ 1,50,000
//               </li>
//             </ul>
//           </div>

//           <button
//             className={`bg-[var(--primary-color)] transition-opacity duration-400 text-white text-sm py-3.5 rounded-md ${
//               !isValid || loading
//                 ? "opacity-90 cursor-not-allowed"
//                 : "opacity-100"
//             }`}
//             type="submit"
//             disabled={!isValid || loading}
//           >
//             {loading ? "Processing..." : "Proceed with Payment"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Wallet;

"use client";
import React, { useContext, useState, useEffect } from "react";
import Image from "next/image";
import { GlobalContext } from "../../GlobalContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSession } from "next-auth/react";

// Helper function to format number in Indian currency format
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
};

function Wallet() {
  const { setWalletOpen, accountCode, server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Get accountCode from session if not in GlobalContext
  const finalAccountCode =
    accountCode || session?.user?.accountCode || session?.user?.email;

  console.log("Wallet Debug:", {
    accountCode,
    sessionAccountCode: session?.user?.accountCode,
    sessionEmail: session?.user?.email,
    finalAccountCode,
    server,
  });

  // Fetch current balance
  const fetchBalance = async () => {
    if (!finalAccountCode) {
      console.error("No account code available");
      setBalanceLoading(false);
      return;
    }

    try {
      setBalanceLoading(true);
      console.log(
        "Fetching balance from:",
        `${server}/payment/balance?accountCode=${finalAccountCode}`
      );

      const response = await axios.get(
        `${server}/payment/balance?accountCode=${finalAccountCode}`
      );

      console.log("Balance response:", response.data);

      if (response.data.success) {
        setBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      console.error("Error details:", error.response?.data);
      setBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (finalAccountCode && server) {
      fetchBalance();
    }
  }, [finalAccountCode, server]);

  // Check for payment success in URL (after redirect from PayU)
  useEffect(() => {
    const checkPaymentStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get("payment");

      if (paymentSuccess === "success") {
        console.log("Payment successful, triggering balance refresh");

        // Dispatch custom event for balance refresh
        window.dispatchEvent(new Event("paymentSuccess"));

        // Refresh balance in this component
        fetchBalance();

        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    };

    checkPaymentStatus();
  }, []);

  const onSubmit = async (data) => {
    if (!finalAccountCode) {
      alert("Account code is not available. Please login again.");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting payment with:", {
        amount: parseFloat(data.amount),
        accountCode: finalAccountCode,
      });

      const response = await axios.post(`${server}/payment/initiate`, {
        amount: parseFloat(data.amount),
        accountCode: finalAccountCode,
      });

      console.log("Payment response:", response.data);

      if (response.data.success) {
        setCheckoutData(response.data);
        setShowCheckout(true);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `Failed to initiate payment: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!checkoutData) return;

    console.log("Checkout data:", checkoutData);

    // Create a form and submit it to PayU
    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkoutData.paymentData.payuUrl;

    // Use surl and furl from backend response
    const params = {
      key: checkoutData.paymentData.key,
      txnid: checkoutData.paymentData.txnid,
      amount: checkoutData.paymentData.amount,
      productinfo: checkoutData.paymentData.productinfo,
      firstname: checkoutData.paymentData.firstname,
      email: checkoutData.paymentData.email,
      phone: checkoutData.paymentData.phone,
      surl: `${server}/payment/success`,
      furl: `${server}/payment/failure`,
      hash: checkoutData.paymentData.hash,
      udf1: checkoutData.paymentData.accountCode,
    };

    console.log("Payment form data:", params);
    console.log("Submitting to PayU URL:", form.action);

    Object.keys(params).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // Watch the 'amount' input field
  const amount = watch("amount", "");

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (rawValue === "") {
      setValue("amount", "", { shouldValidate: true, shouldDirty: true });
    } else if (!isNaN(rawValue) && /^[0-9]*$/.test(rawValue)) {
      setValue("amount", rawValue, { shouldValidate: true, shouldDirty: true });
    } else {
      setValue("amount", amount, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleBlur = () => {
    const parsedAmount = parseFloat(
      (amount || "").toString().replace(/,/g, "")
    );
    if (!isNaN(parsedAmount)) {
      setValue("amount", parsedAmount.toString(), { shouldValidate: true });
    } else {
      setValue("amount", "", { shouldValidate: true });
    }
  };

  const formattedAmount = amount ? formatCurrency(amount) : "";

  // Show error if no account code
  if (!finalAccountCode) {
    return (
      <div
        className="flex flex-col gap-6 text-[#18181B] bg-white rounded-xl shadow-xl px-9 py-6 relative"
        data-wallet-modal
      >
        <div>
          <div className="flex w-full items-center justify-between">
            <span className="text-xl mb-3">Recharge Wallet</span>
            <button onClick={() => setWalletOpen(false)}>
              <Image
                src={`/close-button.svg`}
                width={24}
                height={24}
                alt="close"
              />
            </button>
          </div>
          <hr className="absolute left-0 right-0 text-[#E2E8F0] border-t-2 border-[#e2e8f0]" />
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Account information not available.
          </p>
          <p className="text-gray-600 text-sm">
            Please login again or contact support.
          </p>
        </div>
      </div>
    );
  }

  if (showCheckout && checkoutData) {
    return (
      <div
        className="flex flex-col gap-6 text-[#18181B] bg-white rounded-xl shadow-xl px-9 py-6 relative max-w-2xl"
        data-wallet-modal
      >
        <div>
          <div className="flex w-full items-center justify-between mb-3">
            <span className="text-xl font-semibold text-yellow-600">
              Check out
            </span>
            <button onClick={() => setWalletOpen(false)}>
              <Image
                src={`/close-button.svg`}
                width={24}
                height={24}
                alt="close"
              />
            </button>
          </div>
          <hr className="border-t-2 border-[#e2e8f0]" />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Check Out</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="font-medium">Order Id</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.orderId}
            </div>

            <div className="font-medium">Amount</div>
            <div className="text-gray-700">
              ₹ {formatCurrency(checkoutData.checkoutData.amount)}
            </div>

            <div className="col-span-2 font-semibold mt-2">
              Billing information:
            </div>

            <div className="font-medium">Billing Name</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.billingName}
            </div>

            <div className="font-medium">Billing Address:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.billingAddress}
            </div>

            <div className="font-medium">Billing City:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.billingCity}
            </div>

            <div className="font-medium">Billing State:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.billingState}
            </div>

            <div className="font-medium">Billing Zip:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.billingZip}
            </div>

            <div className="font-medium">Billing Country:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.billingCountry}
            </div>

            <div className="font-medium">Billing Tel:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.billingTel}
            </div>

            <div className="font-medium">Billing Email:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.billingEmail}
            </div>

            <div className="font-medium">Customer Id:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.customerId}
            </div>

            <div className="font-medium">Customer Name:</div>
            <div className="text-gray-700">
              {checkoutData.checkoutData.customerName}
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-[var(--primary-color)] text-white text-sm py-3.5 rounded-md hover:opacity-90 transition-opacity mt-4"
          >
            Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-9 text-[#18181B] bg-white rounded-xl shadow-xl px-9 py-6 relative"
      data-wallet-modal
    >
      <div>
        <div className="flex w-full items-center justify-between">
          <div>
            <span className="text-xl mb-3">Recharge Wallet</span>
            <div className="text-sm text-gray-600 mt-2">
              Current Balance:{" "}
              {balanceLoading ? (
                <span className="text-gray-500">Loading...</span>
              ) : (
                <span className="font-semibold text-green-600">
                  ₹ {formatCurrency(balance)}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setWalletOpen(false)}>
            <Image
              src={`/close-button.svg`}
              width={24}
              height={24}
              alt="close"
            />
          </button>
        </div>
        <hr className="absolute left-0 right-0 text-[#E2E8F0] border-t-2 border-[#e2e8f0]" />
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-9">
          <div className="flex flex-col gap-4">
            <label htmlFor="amount">Enter Amount</label>

            <div className="relative">
              <span
                className={`absolute left-6 top-1/2 transform -translate-y-1/2 transition-colors ${
                  amount ? "" : "text-[#979797]"
                }`}
              >
                ₹
              </span>
              <input
                {...register("amount", {
                  required: "Amount is required",
                  pattern: {
                    value: /^[0-9]+$/i,
                    message: "Only numbers are allowed",
                  },
                  validate: (value) => {
                    const num = parseFloat(value);
                    if (isNaN(num) || num <= 0)
                      return "Amount must be greater than 0";
                    return true;
                  },
                })}
                type="text"
                onChange={handleInputChange}
                onBlur={handleBlur}
                id="amount"
                placeholder="5000"
                className={`pl-10 border rounded px-6 py-2.5 outline-none w-full ${
                  errors.amount ? "border-red-500" : "border-[#979797]"
                }`}
                value={formattedAmount}
              />
            </div>
            {errors.amount && (
              <span className="text-red-500 text-sm">
                {errors.amount.message}
              </span>
            )}

            <ul className="flex gap-4">
              <li
                onClick={() =>
                  setValue("amount", "10000", { shouldValidate: true })
                }
                className="cursor-pointer rounded-3xl border border-[#979797] py-1.5 px-3.5 w-fit hover:bg-gray-50"
              >
                ₹ 10,000
              </li>
              <li
                onClick={() =>
                  setValue("amount", "50000", { shouldValidate: true })
                }
                className="cursor-pointer rounded-3xl border border-[#979797] py-1.5 px-3.5 w-fit hover:bg-gray-50"
              >
                ₹ 50,000
              </li>
              <li
                onClick={() =>
                  setValue("amount", "100000", { shouldValidate: true })
                }
                className="cursor-pointer rounded-3xl border border-[#979797] py-1.5 px-3.5 w-fit hover:bg-gray-50"
              >
                ₹ 1,00,000
              </li>
              <li
                onClick={() =>
                  setValue("amount", "150000", { shouldValidate: true })
                }
                className="cursor-pointer rounded-3xl border border-[#979797] py-1.5 px-3.5 w-fit hover:bg-gray-50"
              >
                ₹ 1,50,000
              </li>
            </ul>
          </div>

          <button
            className={`bg-[var(--primary-color)] transition-opacity duration-400 text-white text-sm py-3.5 rounded-md ${
              !isValid || loading
                ? "opacity-90 cursor-not-allowed"
                : "opacity-100"
            }`}
            type="submit"
            disabled={!isValid || loading}
          >
            {loading ? "Processing..." : "Proceed with Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Wallet;