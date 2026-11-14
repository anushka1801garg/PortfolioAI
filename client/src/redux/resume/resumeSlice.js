import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as resumeService from "../../features/resume/services/resumeService";

// Upload
export const uploadResume = createAsyncThunk(
  "resume/upload",
  async (formData, thunkAPI) => {
    try {
      const response = await resumeService.uploadResume(formData);
      return response.data.resume;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// Get
export const fetchResumes = createAsyncThunk(
  "resume/fetch",
  async (_, thunkAPI) => {
    try {
      const response = await resumeService.getResumes();
      return response.data.resumes;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// Delete
export const deleteResume = createAsyncThunk(
  "resume/delete",
  async (id, thunkAPI) => {
    try {
      await resumeService.deleteResume(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const resumeSlice = createSlice({
  name: "resume",

  initialState: {
    resumes: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchResumes.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.loading = false;
        state.resumes = action.payload;
      })

      .addCase(fetchResumes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(uploadResume.fulfilled, (state, action) => {
        state.resumes.unshift(action.payload);
      })

      .addCase(deleteResume.fulfilled, (state, action) => {
        state.resumes = state.resumes.filter(
          (resume) => resume._id !== action.payload,
        );
      });
  },
});

export default resumeSlice.reducer;
