import { Website } from "~/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WebsiteStore = {
  website: Website | null;
  setCurrentWebsite: (w: Website) => void;
  clear: () => void;
};

const useWebsiteStore = create<WebsiteStore>()(
  persist(
    (set) => ({
      website: null,
      setCurrentWebsite(w) {
        set({ website: w });
      },
      clear() {
        set({ website: null });
      },
    }),
    {
      name: "website-store",
    }
  )
);

export const useWebsiteState = () => useWebsiteStore((state) => state.website);
export const useWebsiteActions = () => ({
  setCurrentWebsite: useWebsiteStore((state) => state.setCurrentWebsite),
  clear: useWebsiteStore((state) => state.clear),
});
