// src/hooks/useNotifications.js
import { useNotifications as useNotificationsContext } from "../context/NotificationsContext";
export function useNotifications() {
  return useNotificationsContext();
}
export default useNotifications;
