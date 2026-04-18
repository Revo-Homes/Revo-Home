import { createSlice } from '@reduxjs/toolkit';

const propertySlice = createSlice({
  name: 'properties',
  initialState: {
    items: [],
    filters: {
      listingType: 'buy', // buy, rent, commercial, plots, pg, commercial_rent, coworking
      location: '',
      budgetMin: '',
      budgetMax: '',
      bhk: [],
      propertyType: [],
      furnishing: [],
      areaMin: '',
      areaMax: '',
      amenities: []
    },
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  },
  reducers: {
    setProperties: (state, action) => {
      state.items = action.payload.items;
      state.pagination = action.payload.pagination;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        listingType: state.filters.listingType,
        location: '',
        budgetMin: '',
        budgetMax: '',
        bhk: [],
        propertyType: [],
        furnishing: [],
        areaMin: '',
        areaMax: '',
        amenities: []
      };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setProperties, updateFilters, resetFilters, setLoading } = propertySlice.actions;
export default propertySlice.reducer;
