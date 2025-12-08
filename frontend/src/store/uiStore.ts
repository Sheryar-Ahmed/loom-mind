import { create } from 'zustand';

/**
 * UI Store
 * Manages UI state (modals, sidebars, etc.)
 */

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Capture Dialog
  isCaptureDialogOpen: boolean;
  setCaptureDialogOpen: (open: boolean) => void;

  // Generic Dialog
  dialogOpen: boolean;
  dialogType: 'capture' | 'collection' | null;
  openDialog: (type: 'capture' | 'collection') => void;
  closeDialog: () => void;

  // Capture Detail Dialog
  selectedCaptureId: string | null;
  setSelectedCaptureId: (id: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Capture Dialog
  isCaptureDialogOpen: false,
  setCaptureDialogOpen: (open) => set({ isCaptureDialogOpen: open }),

  // Generic Dialog
  dialogOpen: false,
  dialogType: null,
  openDialog: (type) => set({ dialogOpen: true, dialogType: type }),
  closeDialog: () => set({ dialogOpen: false, dialogType: null }),

  // Capture Detail Dialog
  selectedCaptureId: null,
  setSelectedCaptureId: (id) => set({ selectedCaptureId: id }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
