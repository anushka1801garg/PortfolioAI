import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",

  initialState: {
    sidebarOpen: true,
    theme: "dark",
  },

  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    changeTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { toggleSidebar, changeTheme } = uiSlice.actions;

export default uiSlice.reducer;
