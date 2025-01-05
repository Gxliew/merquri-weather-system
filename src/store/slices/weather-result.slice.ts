import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WeatherResponse } from '@/types/weather-response'

const initialState: {
  latestDisplayWeatherResult: WeatherResponse | undefined
} = { latestDisplayWeatherResult: undefined }

const weatherResultSlice = createSlice({
  name: 'weatherResultSlice',
  initialState,
  reducers: {
    updateLatestDisplayWeatherResult: (
      state,
      action: PayloadAction<WeatherResponse>
    ) => {
      state.latestDisplayWeatherResult = action.payload
    },
    clearWeatherResult: (state) => {
      state.latestDisplayWeatherResult = undefined
    }
  }
})

export const { updateLatestDisplayWeatherResult, clearWeatherResult } =
  weatherResultSlice.actions

export default weatherResultSlice.reducer
