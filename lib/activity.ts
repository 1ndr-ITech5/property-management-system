import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

export type ActivityType = "booking" | "property" | "system";

export interface Activity {
    id?: string;
    ownerId: string;
    type: ActivityType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: any;
}

export const logActivity = async (
    ownerId: string,
    type: ActivityType,
    title: string,
    message: string
) => {
    try {
        await addDoc(collection(db, "activities"), {
            ownerId,
            type,
            title,
            message,
            isRead: false,
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Failed to log activity:", e);
    }
};

export const markActivityAsRead = async (activityId: string) => {
    try {
        const ref = doc(db, "activities", activityId);
        await updateDoc(ref, { isRead: true });
    } catch (e) {
        console.error("Failed to mark activity as read:", e);
    }
};
