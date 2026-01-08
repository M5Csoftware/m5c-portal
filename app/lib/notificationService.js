import axios from "axios";

const server = process.env.NEXT_PUBLIC_SERVER ?? "";
const api = `${server}/notifications`;

export async function getNotifications(params = {}) {
    try {
        const res = await axios.get(api, { params });
        return res.data; // { notifications, totalPages }
    } catch (error) {
        console.error("Get Notifications Error:", error);
        return { error: error.response?.data?.error || "Failed to fetch notifications" };
    }
}
