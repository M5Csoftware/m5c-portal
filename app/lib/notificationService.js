import axios from "axios";

const server = process.env.NEXT_PUBLIC_SERVER ?? "";

export async function getNotifications(params = {}) {
    try {
        const res = await axios.get(`${server}/notifications`, { params });
        return res.data;
    } catch (error) {
        console.error("Get Notifications Error:", error);
        return { error: "Failed to fetch notifications" };
    }
}

export async function updateNotification(payload = {}) {
    try {
        const res = await axios.put(`${server}/notifications`, payload);
        return res.data;
    } catch (error) {
        console.error("Update Notification Error:", error);
        return { error: "Failed to update notification" };
    }
}

export async function markAllNotificationsAsRead(accountCode) {
    try {
        const res = await axios.patch(`${server}/notifications/mark-all`, { accountCode });
        return res.data;
    } catch (error) {
        console.error("Mark All Read Error:", error);
        return { error: "Failed to mark all as read" };
    }
}
