import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(
      state,
      action: PayloadAction<Omit<Notification, "id" | "createdAt" | "read">>
    ) {
      const notification: Notification = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.items.unshift(notification);
      state.unreadCount += 1;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.items.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
