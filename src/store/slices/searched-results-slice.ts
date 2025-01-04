import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SearchedResult } from '../../types/searched-result'

const initialState: { searchedResults: SearchedResult[] } = { searchedResults: [] }

const searchedResultsSlice = createSlice({
  name: 'searchedResultsSlice',
  initialState,
  reducers: {
    updateSearchedResults: (state, action: PayloadAction<SearchedResult>) => {
      const newDataCity = action.payload.city.toLowerCase()
      const newDataCountry = action.payload.country.toLowerCase()
      const updatingData = state.searchedResults.filter(item => item.city.toLowerCase() !== newDataCity || item.country.toLowerCase() !== newDataCountry)
      updatingData.push(action.payload)
      updatingData.sort((a, b) => b.lastSearchedAt.localeCompare(a.lastSearchedAt))
      state.searchedResults = updatingData
    },
    clearSearchedResults: (state) => {
      state.searchedResults = []
    }
  }
})

export const { updateSearchedResults, clearSearchedResults } =
  searchedResultsSlice.actions

export default searchedResultsSlice.reducer
