import { create } from 'zustand';

export type DirectorModalType =
  | 'none'
  | 'payment'
  | 'student'
  | 'broadcast'
  | 'sync'
  | 'ai_copilot'
  | 'live_classes'
  | 'study_materials'
  | 'recorded_lectures'
  | 'examinations'
  | 'whatsapp_bot'
  | 'quota_reports';

interface DirectorStore {
  activeModal: DirectorModalType;
  openModal: (modal: DirectorModalType) => void;
  closeModal: () => void;
}

export const useDirectorStore = create<DirectorStore>((set) => ({
  activeModal: 'none',
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: 'none' }),
}));
