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
import { WeatherResponse } from './types/weather-response'

function App() {
  const appDispatch = useDispatch()
  const searchedResults = useSelector(
    (state: RootState) => state.searchedResultsSlice.searchedResults
  )
  const [queryObject, setQueryObject] = useState<{
    [key: string]: string | number
  }>({})
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [weatherResult, setWeatherResult] = useState<
    WeatherResponse | undefined
  >()

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
      } else {
        setErrorMessage('Geolocation not found.')
      }
    } catch (error) {
      setErrorMessage(
        'Error fetching geolocation, please check your search query and try again later.'
      )
      console.log(error)
    }

    return null
  }, [queryObject, appDispatch])

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await axiosInstance.get(
        `${TodayWeatherApi}?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`
      )
      setWeatherResult(response as unknown as WeatherResponse)
    } catch (error) {
      setErrorMessage(
        'Error fetching weather data for the searched location, please try again later.'
      )
    }
  }, [])

  const searchTodayWeatherData = useCallback(async () => {
    setErrorMessage('')
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
      setErrorMessage('')
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
      {errorMessage && <div className='bg-danger'>{errorMessage}</div>}
      {searchedResults.length > 0 && weatherResult && (
        <div className='d-flex text-start'>
          <div>
            <p>Description:</p>
            <p>Temperature:</p>
            <p>Humidity:</p>
            <p>Time:</p>
          </div>
          <div>
            <p>
              {weatherResult?.weather?.length > 0
                ? weatherResult?.weather[0].description
                : '-'}
            </p>
            <p>
              {weatherResult.main.temp_min}&deg;C ~ {weatherResult.main.temp_max}&deg;C
            </p>
            <p>{weatherResult.main.humidity}%</p>
            <p>{moment(weatherResult.dt * 1000).format('yyyy-MM-DD HH:mmA')}</p>
          </div>
        </div>
      )}
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
