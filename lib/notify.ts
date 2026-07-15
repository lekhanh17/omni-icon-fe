import Notification from "../models/Notification";

interface CreateNotificationInput {
  recipientId: string;
  type: "comment" | "like" | "report_resolved" | "follow";
  message: string;
  link?: string;
}

// Tạo 1 thông báo cho người dùng. Cố ý nuốt lỗi (không throw) để việc tạo
// thông báo không bao giờ làm hỏng luồng chính (thích icon, bình luận, xử lý báo cáo...)
export async function createNotification({
  recipientId,
  type,
  message,
  link = "",
}: CreateNotificationInput): Promise<void> {
  try {
    await Notification.create({ recipientId, type, message, link });
  } catch (error) {
    console.error("Lỗi tạo thông báo:", error);
  }
}
