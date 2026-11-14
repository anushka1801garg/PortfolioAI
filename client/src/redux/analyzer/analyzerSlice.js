import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as analyzerService from "../../features/analyzer/services/analyzerService";

export const analyzeResume = createAsyncThunk(
  "analyzer/analyze",
  async (formData, thunkAPI) => {
    try {
      const response = await analyzerService.analyzeResume(formData);
      return response.data.analysis;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const analyzerSlice = createSlice({
  name: "analyzer",

  initialState: {
    analysis: null,
    loading: false,
    error: null,
    resumeFile: null,
  },

  reducers: {
    setResumeFile: (state, action) => {
      state.resumeFile = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(analyzeResume.pending, (state) => {
        state.loading = true;
      })

      .addCase(analyzeResume.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
      })

      .addCase(analyzeResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setResumeFile } = analyzerSlice.actions;

export default analyzerSlice.reducer;
