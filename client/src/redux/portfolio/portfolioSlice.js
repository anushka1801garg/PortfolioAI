import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as portfolioService from "../../features/portfolio/services/portfolioService";

// Get All Portfolios
export const fetchPortfolios = createAsyncThunk(
  "portfolio/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await portfolioService.getAllPortfolios();
      return response.data.portfolios;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const fetchPortfolioById = createAsyncThunk(
  "portfolio/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await portfolioService.getPortfolio(id);

      return response.data.portfolio;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// Create Portfolio
export const createPortfolio = createAsyncThunk(
  "portfolio/create",
  async (data, thunkAPI) => {
    try {
      const response = await portfolioService.createPortfolio(data);
      return response.data.portfolio;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updatePortfolio = createAsyncThunk(
  "portfolio/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await portfolioService.updatePortfolio(id, data);

      return response.data.portfolio;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const uploadPortfolioAvatar = createAsyncThunk(
  "portfolio/uploadAvatar",
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await portfolioService.uploadPortfolioAvatar(id, formData);
      return response.data.portfolio;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const uploadPortfolioResume = createAsyncThunk(
  "portfolio/uploadResume",
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await portfolioService.uploadPortfolioResume(id, formData);
      return response.data.portfolio;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const deletePortfolio = createAsyncThunk(
  "portfolio/delete",
  async (id, thunkAPI) => {
    try {
      await portfolioService.deletePortfolio(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const initialState = {
  portfolios: [],
  currentPortfolio: null,
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Fetch All

      .addCase(fetchPortfolios.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolios = action.payload;
      })

      .addCase(fetchPortfolios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create

      // Create

      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.portfolios.unshift(action.payload);
      })

      // Update

      .addCase(updatePortfolio.fulfilled, (state, action) => {
        state.portfolios = state.portfolios.map((portfolio) =>
          portfolio._id === action.payload._id ? action.payload : portfolio,
        );
        if (state.currentPortfolio && state.currentPortfolio._id === action.payload._id) {
          state.currentPortfolio = action.payload;
        }
      })

      .addCase(uploadPortfolioAvatar.fulfilled, (state, action) => {
        state.portfolios = state.portfolios.map((portfolio) =>
          portfolio._id === action.payload._id ? action.payload : portfolio,
        );
        if (state.currentPortfolio && state.currentPortfolio._id === action.payload._id) {
          state.currentPortfolio = action.payload;
        }
      })

      .addCase(uploadPortfolioResume.fulfilled, (state, action) => {
        state.portfolios = state.portfolios.map((portfolio) =>
          portfolio._id === action.payload._id ? action.payload : portfolio,
        );
        if (state.currentPortfolio && state.currentPortfolio._id === action.payload._id) {
          state.currentPortfolio = action.payload;
        }
      })

      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.portfolios = state.portfolios.filter(
          (portfolio) => portfolio._id !== action.payload,
        );
      })

      .addCase(fetchPortfolioById.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchPortfolioById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPortfolio = action.payload;
      })

      .addCase(fetchPortfolioById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default portfolioSlice.reducer;
