import { useCallback, useState } from 'react'
import './App.css'
import axiosInstance from './axios/axios'
import { GetGeoApi, TodayWeatherApi } from './constants/apis'
import Input from './components/input'
import Button from './components/button'
import { cloneDeep } from 'lodash'
import { GeoLocationResponse } from './types/geo-location-response'
import { useDispatch, useSelector } from 'react-redux'
import {
  addNewSearchedResult,
  replaceExistingSearchedResult,
  updateSearchedResults
} from './store/slices/searched-results-slice'
import moment from 'moment'
import { RootState } from './store/store'
import SearchedResultItem from './components/searched-result-item'

function App() {
  const appDispatch = useDispatch()
  const searchedResults = useSelector(
    (state: RootState) => state.searchedResultsSlice.searchedResults
  )
  const [queryObject, setQueryObject] = useState<{
    [key: string]: string | number
  }>({})

  const fetchGeoLocation = useCallback(async () => {
    try {
      let query = ''
      const city = queryObject['city'] ?? ''
      const country = queryObject['country'] ?? ''
      if (city) {
        query = query + city
      }

      if (country) {
        query = query + (query.length > 0 ? ',' : '') + country
      }

      const response: GeoLocationResponse[] = await axiosInstance.get(
        `${GetGeoApi}?q=${query}&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`
      )

      if (response.length > 0) {
        console.log(response[0])
        appDispatch(
          addNewSearchedResult({
            city: response[0].name,
            country: response[0].country,
            lat: response[0].lat,
            lon: response[0].lon,
            lastSearchedAt: moment().format('yyyy-MM-DD HH:mm:ss')
          })
        )
        return response[0]
      }
    } catch (error) {
      console.log(error)
    }

    return null
  }, [queryObject, appDispatch])

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    await axiosInstance.get(
      `${TodayWeatherApi}?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`
    )
  }, [])

  const searchTodayWeatherData = useCallback(async () => {
    const geolocationResponse = await fetchGeoLocation()
    if (geolocationResponse) {
      await fetchWeatherData(geolocationResponse.lat, geolocationResponse.lon)
    }
  }, [fetchGeoLocation, fetchWeatherData])

  const updateQueryObject = useCallback(
    (key: string, value: string | number) => {
      const updatingQueryObject = cloneDeep(queryObject)
      updatingQueryObject[key] = value
      setQueryObject(updatingQueryObject)
    },
    [queryObject]
  )

  const handleSearchFromPreviousResult = useCallback(
    async (index: number) => {
      const lat = searchedResults[index].lat
      const lon = searchedResults[index].lon
      await fetchWeatherData(lat, lon)
      appDispatch(
        replaceExistingSearchedResult({
          lat,
          lon,
          lastSearchedAt: moment().format('yyyy-MM-DD HH:mm:ss')
        })
      )
    },
    [searchedResults, fetchWeatherData, appDispatch]
  )

  const handleDeleteSearchedResult = useCallback(
    (index: number) => {
      const updatingSearchedResults = cloneDeep(searchedResults)
      updatingSearchedResults.splice(index, 1)
      appDispatch(updateSearchedResults(updatingSearchedResults))
    },
    [searchedResults, appDispatch]
  )

  return (
    <div className='App'>
      <Input
        type='text'
        onChange={(e) => updateQueryObject('city', e)}
        value={queryObject['city'] ?? ''}
        label={'City'}
      />
      <Input
        type='text'
        onChange={(e) => updateQueryObject('country', e)}
        value={queryObject['country'] ?? ''}
        label={'Country'}
      />
      <Button
        children={<p>Search</p>}
        onClick={() => {
          searchTodayWeatherData()
        }}
      />
      <hr />
      {searchedResults.length > 0 &&
        searchedResults.map((item, index) => {
          return (
            <SearchedResultItem
              searchedResult={item}
              index={index}
              onSearch={handleSearchFromPreviousResult}
              onDelete={handleDeleteSearchedResult}
            />
          )
        })}
    </div>
  )
}

export default App
