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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { updateLatestDisplayWeatherResult } from './store/slices/weather-result.slice'
import Sun from './assets/images/sun.png'

function App() {
  const appDispatch = useDispatch()
  const searchedResults = useSelector(
    (state: RootState) => state.searchedResultsSlice.searchedResults
  )
  const weatherResult = useSelector(
    (state: RootState) => state.weatherResultSlice.latestDisplayWeatherResult
  )
  const [queryObject, setQueryObject] = useState<{
    [key: string]: string | number
  }>({})
  const [errorMessage, setErrorMessage] = useState<string>('')

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

  const fetchWeatherData = useCallback(
    async (lat: number, lon: number) => {
      try {
        const response = await axiosInstance.get(
          `${TodayWeatherApi}?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`
        )
        appDispatch(
          updateLatestDisplayWeatherResult(
            response as unknown as WeatherResponse
          )
        )
      } catch (error) {
        setErrorMessage(
          'Error fetching weather data for the searched location, please try again later.'
        )
      }
    },
    [appDispatch]
  )

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
      {/* <Input
        type='text'
        onChange={(e) => updateQueryObject('city', e)}
        value={queryObject['city'] ?? ''}
        label={'City'}
      /> */}
      <div className='d-flex align-items-center'>
        <Input
          className='country-search-input'
          style={{ marginRight: '20px', width: '95%' }}
          type='text'
          onChange={(e) => updateQueryObject('country', e)}
          value={queryObject['country'] ?? ''}
          label={'Country'}
        />
        <Button
          className='query-search-button'
          children={
            <FontAwesomeIcon
              icon={faSearch}
              color='white'
              style={{ height: 34, width: 34 }}
            />
          }
          onClick={() => {
            searchTodayWeatherData()
          }}
        />
      </div>
      {errorMessage && (
        <div className='mt-4 rounded' style={{ backgroundColor: '#F54C49' }}>
          {errorMessage}
        </div>
      )}
      {searchedResults.length > 0 && (
        <div className='searched-results-body'>
          <img
            className='search-results-body-image'
            src={Sun}
            alt='sun'
            style={{ position: 'absolute', top: '-115px', right: '0' }}
          />
          {weatherResult && (
            <div style={{ textAlign: 'left' }}>
              <p style={{ marginBottom: 0 }}>Today’s Weather</p>
              <p style={{ fontWeight: 'bold', fontSize: '80px' }}>
                {weatherResult.main.temp}&deg;
              </p>
              <p style={{ marginBottom: 10 }}>
                H: {weatherResult.main.temp_max}&deg; L:{' '}
                {weatherResult.main.temp_min}&deg;
              </p>
              <div className='d-flex justify-content-between'>
                <p className='fw-bold'>
                  {searchedResults[0].city}, {searchedResults[0].country}
                </p>
                <p>
                  {moment(weatherResult.dt * 1000).format('yyyy-MM-DD HH:mmA')}
                </p>
                <p>Humidity: {weatherResult.main.humidity}%</p>
                <p>
                  {weatherResult?.weather?.length > 0
                    ? weatherResult?.weather[0].main
                    : '-'}
                </p>
              </div>
            </div>
          )}
          <div className='searched-result-items-list'>
            {searchedResults.map((item, index) => {
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
        </div>
      )}
    </div>
  )
}

export default App
