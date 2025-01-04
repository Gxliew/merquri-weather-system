import { combineReducers } from 'redux'
import searchedResultsSlice from './slices/searched-results-slice'

const rootReducer = combineReducers({
  searchedResultsSlice: searchedResultsSlice
})

export default rootReducer
