import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  isRecording: false,
  isProcessing: false,
  isPlaying: false,
  
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setRecording: (status) => set({ isRecording: status }),
  setProcessing: (status) => set({ isProcessing: status }),
  setPlaying: (status) => set({ isPlaying: status }),
}));

export default useChatStore;