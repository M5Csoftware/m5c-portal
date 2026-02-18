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
