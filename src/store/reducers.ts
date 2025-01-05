import { combineReducers } from 'redux'
import searchedResultsSlice from './slices/searched-results-slice'
import weatherResultSlice from './slices/weather-result.slice'

const rootReducer = combineReducers({
  searchedResultsSlice: searchedResultsSlice,
  weatherResultSlice: weatherResultSlice
})

export default rootReducer
