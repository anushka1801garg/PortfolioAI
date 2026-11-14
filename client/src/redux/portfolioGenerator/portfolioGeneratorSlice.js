import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as portfolioGeneratorService from "../../features/portfolio/services/portfolioGeneratorService";

export const generatePortfolio = createAsyncThunk(
  "portfolioGenerator/generate",
  async (formData, thunkAPI) => {
    try {
      const response =
        await portfolioGeneratorService.generatePortfolio(formData);

      return {
        portfolio: response.data.portfolio,
        missingInfo: response.data.missingInfo || [],
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const portfolioGeneratorSlice = createSlice({
  name: "portfolioGenerator",

  initialState: {
    portfolio: null,
    missingInfo: [],
    loading: false,
    error: null,
  },

  reducers: {
    setGeneratedPortfolio: (state, action) => {
      state.portfolio = action.payload;
    },
    setMissingInfo: (state, action) => {
      state.missingInfo = action.payload || [];
    },
    resolveMissingField: (state, action) => {
      const field = action.payload;
      state.missingInfo = state.missingInfo.filter(
        (item) => item.field !== field,
      );
    },
    clearGeneratedPortfolio: (state) => {
      state.portfolio = null;
      state.missingInfo = [];
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(generatePortfolio.pending, (state) => {
        state.loading = true;
      })
      .addCase(generatePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload?.portfolio || action.payload;
        state.missingInfo = action.payload?.missingInfo || [];
      })
      .addCase(generatePortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setGeneratedPortfolio,
  setMissingInfo,
  resolveMissingField,
  clearGeneratedPortfolio,
} = portfolioGeneratorSlice.actions;

export default portfolioGeneratorSlice.reducer;
