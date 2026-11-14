import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../redux/auth/authSlice";
import portfolioReducer from "../redux/portfolio/portfolioSlice";
import uiReducer from "../redux/ui/uiSlice";
import profileReducer from "../redux/profile/profileSlice";
import resumeReducer from "../redux/resume/resumeSlice";
import analyzerReducer from "../redux/analyzer/analyzerSlice";
import portfolioGeneratorReducer from "../redux/portfolioGenerator/portfolioGeneratorSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    portfolio: portfolioReducer,
    ui: uiReducer,
    resume: resumeReducer,
    analyzer: analyzerReducer,
    portfolioGenerator: portfolioGeneratorReducer,
  },
});
