import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SearchedResult } from '../../types/searched-result'
import { cloneDeep } from 'lodash'

export type UpdateLastSearchedAtPayload = {
    lat: number
    lon: number
    lastSearchedAt: string
}

const initialState: { searchedResults: SearchedResult[] } = { searchedResults: [] }

const searchedResultsSlice = createSlice({
  name: 'searchedResultsSlice',
  initialState,
  reducers: {
    addNewSearchedResult: (state, action: PayloadAction<SearchedResult>) => {
        const newDataCity = action.payload.city.toLowerCase()
        const newDataCountry = action.payload.country.toLowerCase()
        //add or replace searched history record
        const updatingData = state.searchedResults.filter(item => item.city.toLowerCase() !== newDataCity || item.country.toLowerCase() !== newDataCountry)
        updatingData.push(action.payload)
        //sort by searched datetime in descending order, latest on the top
        updatingData.sort((a, b) => b.lastSearchedAt.localeCompare(a.lastSearchedAt))
        state.searchedResults = updatingData
    },
    replaceExistingSearchedResult: (state, action: PayloadAction<UpdateLastSearchedAtPayload>) => {
        const replacingIndex = state.searchedResults.findIndex(item => item.lat === action.payload.lat && item.lon === action.payload.lon)
        if(replacingIndex !== -1) {
            //use for updating the last search timing for a previous search history record
            const updatingData = cloneDeep(state.searchedResults)
            updatingData.splice(replacingIndex, 1, {...updatingData[replacingIndex], lastSearchedAt: action.payload.lastSearchedAt})
            state.searchedResults = updatingData.sort((a, b) => b.lastSearchedAt.localeCompare(a.lastSearchedAt))
        }
    },
    updateSearchedResults: (state, action: PayloadAction<SearchedResult[]>) => {
        state.searchedResults = action.payload
    },
    clearSearchedResults: (state) => {
      state.searchedResults = []
    }
  }
})

export const { addNewSearchedResult, updateSearchedResults, replaceExistingSearchedResult, clearSearchedResults } =
  searchedResultsSlice.actions

export default searchedResultsSlice.reducer
