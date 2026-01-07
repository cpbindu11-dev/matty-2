import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import designReducer from "./designSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    designs: designReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['designs/saveDesign/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.jsonData'],
        // Ignore these paths in the state
        ignoredPaths: ['designs.currentDesign.jsonData'],
      },
    }),
});