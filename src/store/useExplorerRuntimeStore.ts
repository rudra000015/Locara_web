import { create } from 'zustand';
import { AppNotification } from '@/types/notification';

export interface ActiveTrip {
  shopId: string;
  shopName: string;
  destination: {
    lat: number;
    lng: number;
  };
  startedAt: string;
  arrivedAt?: string;
  completedAt?: string;
}

type LiveStatus = 'idle' | 'connecting' | 'live' | 'error';

interface ExplorerRuntimeStore {
  notifications: AppNotification[];
  readIds: string[];
  popupIds: string[];
  liveStatus: LiveStatus;
  activeTrip: ActiveTrip | null;
  hydrateReadIds: (ids: string[]) => void;
  setNotifications: (items: AppNotification[]) => void;
  upsertNotification: (item: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissPopup: (id: string) => void;
  setLiveStatus: (status: LiveStatus) => void;
  startTrip: (trip: Omit<ActiveTrip, 'startedAt'>) => void;
  markTripArrived: () => void;
  completeTrip: () => void;
  clearTrip: () => void;
}

function sortNotifications(items: AppNotification[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const useExplorerRuntimeStore = create<ExplorerRuntimeStore>((set, get) => ({
  notifications: [],
  readIds: [],
  popupIds: [],
  liveStatus: 'idle',
  activeTrip: null,
  hydrateReadIds: (readIds) => set({ readIds }),
  setNotifications: (items) =>
    set((state) => {
      const incoming = sortNotifications(items);
      if (state.notifications.length === 0) {
        return {
          notifications: incoming,
          popupIds: state.popupIds,
        };
      }

      const existingIds = new Set(state.notifications.map((item) => item.id));
      const popupIds = [...state.popupIds];

      for (const item of incoming) {
        if (!existingIds.has(item.id) && !state.readIds.includes(item.id)) {
          popupIds.unshift(item.id);
        }
      }

      return {
        notifications: incoming,
        popupIds: Array.from(new Set(popupIds)).slice(0, 4),
      };
    }),
  upsertNotification: (item) =>
    set((state) => {
      const exists = state.notifications.some((entry) => entry.id === item.id);
      const notifications = sortNotifications(
        exists
          ? state.notifications.map((entry) => (entry.id === item.id ? item : entry))
          : [item, ...state.notifications]
      );

      return {
        notifications,
        popupIds:
          exists || state.readIds.includes(item.id)
            ? state.popupIds
            : Array.from(new Set([item.id, ...state.popupIds])).slice(0, 4),
      };
    }),
  markRead: (id) =>
    set((state) => ({
      readIds: state.readIds.includes(id) ? state.readIds : [...state.readIds, id],
      popupIds: state.popupIds.filter((popupId) => popupId !== id),
    })),
  markAllRead: () =>
    set((state) => ({
      readIds: Array.from(new Set([...state.readIds, ...state.notifications.map((item) => item.id)])),
      popupIds: [],
    })),
  dismissPopup: (id) =>
    set((state) => ({
      popupIds: state.popupIds.filter((popupId) => popupId !== id),
    })),
  setLiveStatus: (liveStatus) => set({ liveStatus }),
  startTrip: (trip) =>
    set({
      activeTrip: {
        ...trip,
        startedAt: new Date().toISOString(),
      },
    }),
  markTripArrived: () =>
    set((state) => ({
      activeTrip: state.activeTrip
        ? {
            ...state.activeTrip,
            arrivedAt: state.activeTrip.arrivedAt ?? new Date().toISOString(),
          }
        : null,
    })),
  completeTrip: () =>
    set((state) => ({
      activeTrip: state.activeTrip
        ? {
            ...state.activeTrip,
            completedAt: new Date().toISOString(),
          }
        : null,
    })),
  clearTrip: () => set({ activeTrip: null }),
}));
