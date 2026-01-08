"use client";

import { LogOutIcon, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../../GlobalContext";
import NotificationFlag from "../../component/NotificationFlag";
import { useRouter } from "next/navigation";

const DataPrivacySecurity = () => {
    const { server } = useContext(GlobalContext);
    const { data: session } = useSession();
    const router = useRouter();

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [deviceHistory, setDeviceHistory] = useState([]);
    const [currentDevice, setCurrentDevice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [notification, setNotification] = useState({
        visible: false,
        message: "",
        subMessage: "",
    });

    useEffect(() => {
        if (session?.user?.accountCode) {
            fetchDeviceHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const fetchDeviceHistory = async () => {
        try {
            const accountCode = session?.user?.accountCode;
            if (!accountCode) return;

            console.log("Fetching device history for:", accountCode);

            const response = await axios.get(
                `${server}/portal/privacy-security/data-privacy-security?accountCode=${accountCode}`
            );

            console.log("Device history response:", response.data);

            if (response.data.success) {
                console.log("Device History:", response.data.data.deviceHistory);
                console.log("Current Device:", response.data.data.currentDevice);
                console.log("Current Device IP:", response.data.data.currentDevice?.ip);
                console.log("Current Device UA:", response.data.data.currentDevice?.userAgent);

                setDeviceHistory(response.data.data.deviceHistory || []);
                setCurrentDevice(response.data.data.currentDevice);
            }
        } catch (error) {
            console.error("Error fetching device history:", error);
            console.error("Error details:", error.response?.data);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        console.log("=== Password Update Attempt ===");
        console.log("Current Password:", passwords.currentPassword);
        console.log("New Password:", passwords.newPassword);
        console.log("Confirm Password:", passwords.confirmPassword);

        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            setNotification({
                visible: true,
                message: "Validation Error",
                subMessage: "All password fields are required.",
            });
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setNotification({
                visible: true,
                message: "Password Mismatch",
                subMessage: "New password and confirm password do not match.",
            });
            return;
        }

        if (passwords.newPassword.length < 6) {
            setNotification({
                visible: true,
                message: "Weak Password",
                subMessage: "Password must be at least 6 characters long.",
            });
            return;
        }

        try {
            setLoading(true);
            const accountCode = session?.user?.accountCode;

            console.log("Sending password update request for:", accountCode);

            const response = await axios.post(
                `${server}/portal/privacy-security/data-privacy-security`,
                {
                    accountCode,
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                    action: "updatePassword",
                }
            );

            console.log("Password update response:", response.data);

            if (response.data.success) {
                setNotification({
                    visible: true,
                    message: "Password Updated",
                    subMessage: "Your password has been updated successfully.",
                });

                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            console.error("Error updating password:", error);
            console.error("Error response:", error.response?.data);

            setNotification({
                visible: true,
                message: "Update Failed",
                subMessage: error.response?.data?.message || "Failed to update password. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutClick = (sessionId, isCurrentDevice) => {
        setSelectedSessionId(sessionId);
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        try {
            setIsLoggingOut(true);
            const accountCode = session?.user?.accountCode;

            console.log("=== Device Logout ===");
            console.log("Account Code:", accountCode);
            console.log("Session ID:", selectedSessionId);

            const response = await axios.delete(
                `${server}/portal/privacy-security/data-privacy-security?accountCode=${accountCode}&sessionId=${selectedSessionId}`
            );

            console.log("Logout response:", response.data);

            if (response.data.success) {
                // Check if we're logging out the current device
                const deviceToLogout = deviceHistory.find(d => d.sessionId === selectedSessionId);
                const isCurrentDeviceLogout = isCurrentDevice(deviceToLogout);

                if (isCurrentDeviceLogout) {
                    // If logging out current device, sign out and redirect to home
                    await signOut({ redirect: false });
                    router.push("/");
                } else {
                    // If logging out another device, just refresh the list
                    setNotification({
                        visible: true,
                        message: "Device Logged Out",
                        subMessage: "The device has been logged out successfully.",
                    });
                    fetchDeviceHistory();
                }
            }
        } catch (error) {
            console.error("Error logging out device:", error);
            console.error("Error response:", error.response?.data);

            setNotification({
                visible: true,
                message: "Logout Failed",
                subMessage: "Failed to logout device. Please try again.",
            });
        } finally {
            setIsLoggingOut(false);
            setShowLogoutModal(false);
            setSelectedSessionId(null);
        }
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
        setSelectedSessionId(null);
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const isCurrentDevice = (device) => {
        if (!currentDevice) return false;

        // For localhost/same IP scenarios, compare based on sessionId or lastSeen time
        // The current device should be the most recent one with matching IP and userAgent
        if (device.ip === currentDevice.ip && device.userAgent === currentDevice.userAgent) {
            // Check if this is the exact session (most recent)
            const deviceTime = new Date(device.lastSeen).getTime();
            const currentTime = new Date(currentDevice.lastSeen || new Date()).getTime();
            const timeDiff = Math.abs(deviceTime - currentTime);

            // If within 5 seconds, consider it the current device
            return timeDiff < 5000;
        }

        return false;
    };

    return (
        <>
            <div className="space-y-6">
                {/* Password Update */}
                <div className="bg-white p-8 rounded-md">
                    <div className="mb-6">
                        <h2 className="font-semibold text-xl">Password Update</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Keep your account secure with a strong password.
                        </p>
                    </div>

                    <form className="space-y-5 max-w-2xl" onSubmit={handlePasswordUpdate}>
                        <div>
                            <label className="font-medium text-sm block mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.currentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="border border-gray-300 px-4 py-3 rounded-md w-full text-sm focus:ring-2 focus:ring-red-400 focus:outline-none pr-10"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("currentPassword")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.currentPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="font-medium text-sm block mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.newPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    className="border border-gray-300 px-4 py-3 rounded-md w-full text-sm focus:ring-2 focus:ring-red-400 focus:outline-none pr-10"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("newPassword")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.newPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="font-medium text-sm block mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="border border-gray-300 px-4 py-3 rounded-md w-full text-sm focus:ring-2 focus:ring-red-400 focus:outline-none pr-10"
                                    placeholder="Re-enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirmPassword")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.confirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-[#EA2147] hover:bg-[#d41c3d] transition text-white font-semibold text-sm rounded-md px-6 py-3 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>

                {/* Device History */}
                <div className="bg-white p-8 rounded-md">
                    <div className="mb-6">
                        <h2 className="font-semibold text-xl">Device History</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Devices that have accessed your account recently.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-white text-gray-700 border-b">
                                    <th className="py-4 px-4 text-left font-semibold">Device</th>
                                    <th className="py-4 px-4 text-left font-semibold">Browser</th>
                                    <th className="py-4 px-4 text-left font-semibold">OS</th>
                                    <th className="py-4 px-4 text-left font-semibold">
                                        IP Address
                                    </th>
                                    <th className="py-4 px-4 text-left font-semibold">Location</th>
                                    <th className="py-4 px-4 text-left font-semibold">Last Seen</th>
                                    <th className="py-4 px-4 text-center font-semibold">Action</th>
                                </tr>
                            </thead>

                            <tbody className="text-gray-600">
                                {deviceHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 px-4 text-center text-gray-400">
                                            No device history available
                                        </td>
                                    </tr>
                                ) : (
                                    deviceHistory.map((device, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50 transition">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{device.deviceName}</span>
                                                    {isCurrentDevice(device) && (
                                                        <div className="text-xs py-1 px-2 rounded text-[#188C43] bg-[#BAEDCD] font-semibold">
                                                            Current
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">{device.browser || "Unknown"}</td>
                                            <td className="py-4 px-4">{device.os || "Unknown"}</td>
                                            <td className="py-4 px-4 font-mono text-xs">{device.ip}</td>
                                            <td className="py-4 px-4">{device.location || "Unknown"}</td>
                                            <td className="py-4 px-4 text-xs">{getTimeAgo(device.lastSeen)}</td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleLogoutClick(device.sessionId, isCurrentDevice(device))}
                                                    className="inline-flex items-center justify-center gap-1.5 font-semibold py-2 px-4 rounded-md text-[#EA2147] bg-[#FDE9ED] hover:bg-[#fbd3db] transition text-xs"
                                                    title="Logout this device"
                                                >
                                                    <LogOutIcon size={16} />
                                                    Logout
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000]">
                    {isLoggingOut ? (
                        <div className="bg-white rounded-lg px-6 py-16 w-[300px] flex flex-col gap-6 items-center shadow-lg">
                            <div className="loader"></div>
                            <h2 className="text-base font-bold">Logging Out...</h2>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg px-6 py-5 w-[300px] flex flex-col gap-9 items-center shadow-lg">
                            <h2 className="text-xl font-bold">Logout from this device?</h2>
                            <div className="flex justify-between gap-4 w-full">
                                <button
                                    onClick={cancelLogout}
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

            <NotificationFlag
                message={notification.message}
                subMessage={notification.subMessage}
                visible={notification.visible}
                setVisible={(visible) =>
                    setNotification((prev) => ({ ...prev, visible }))
                }
            />
        </>
    );
};

export default DataPrivacySecurity;