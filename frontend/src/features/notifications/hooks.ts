import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getNotifications, markNotificationAsRead } from "./api";

export const notificationsQueryKey = ["notifications"];

export const useNotifications = (enabled: boolean) => {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
    enabled,
    initialData: {
      items: [],
      unread_count: 0,
    },
    refetchInterval: 30000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
};
