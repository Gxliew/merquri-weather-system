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
import { clearWeatherResult, updateLatestDisplayWeatherResult } from './store/slices/weather-result.slice'
import Sun from './assets/images/sun.png'
import useIsMobile from './hooks/use-is-mobile'

function App() {
  const appDispatch = useDispatch()
  const searchedResults = useSelector(
    (state: RootState) => state.searchedResultsSlice.searchedResults
  )
  const weatherResult = useSelector(
    (state: RootState) => state.weatherResultSlice.latestDisplayWeatherResult
  )
  const [queryString, setQueryString] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { isMobile } = useIsMobile()

  //function to fetch geolocaton using query string entered
  const fetchGeoLocation = useCallback(async () => {
    try {
      const response: GeoLocationResponse[] = await axiosInstance.get(
        `${GetGeoApi}?q=${queryString}&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`
      )

      if (response.length > 0) {
        console.log(response[0])
        //update the redux slice for search history array
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
  }, [queryString, appDispatch])

  //function to fetch weather data using geolocation
  const fetchWeatherData = useCallback(
    async (lat: number, lon: number) => {
      try {
        const response = await axiosInstance.get(
          `${TodayWeatherApi}?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`
        )
        //update the display weather result to redux slice
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

  //function to combine getting geolocation then query for weather data
  const searchTodayWeatherData = useCallback(async () => {
    setErrorMessage('')
    const geolocationResponse = await fetchGeoLocation()
    if (geolocationResponse) {
      await fetchWeatherData(geolocationResponse.lat, geolocationResponse.lon)
    }
  }, [fetchGeoLocation, fetchWeatherData])

  //function to search using history records as it will skip the geolocation fetching
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

  //function to delete searched history record
  const handleDeleteSearchedResult = useCallback(
    (index: number) => {
      const updatingSearchedResults = cloneDeep(searchedResults)
      updatingSearchedResults.splice(index, 1)
      appDispatch(updateSearchedResults(updatingSearchedResults))
      if(updatingSearchedResults.length > 0) {
        fetchWeatherData(updatingSearchedResults[0].lat, updatingSearchedResults[0].lon)
      } else {
        appDispatch(clearWeatherResult())
      }
      
    },
    [searchedResults, appDispatch, fetchWeatherData]
  )

  return (
    <div className='App'>
      <div className='d-flex align-items-center'>
        <Input
          className='country-search-input'
          style={{ marginRight: '20px', width: '95%' }}
          type='text'
          onChange={(e) => setQueryString(e.toString())}
          value={queryString}
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
                {!isMobile ? (
                  <>
                    <p>
                      {moment(weatherResult.dt * 1000).format(
                        'yyyy-MM-DD HH:mmA'
                      )}
                    </p>
                    <p>Humidity: {weatherResult.main.humidity}%</p>
                    <p>
                      {weatherResult?.weather?.length > 0
                        ? weatherResult?.weather[0].main
                        : '-'}
                    </p>
                  </>
                ) : (
                  <div style={{ marginBottom: '16px', textAlign: 'end' }}>
                    <p className='mb-0'>
                      {weatherResult?.weather?.length > 0
                        ? weatherResult?.weather[0].main
                        : '-'}
                    </p>
                    <p className='mb-0'>
                      Humidity: {weatherResult.main.humidity}%
                    </p>
                    <p className='mb-0'>
                      {moment(weatherResult.dt * 1000).format(
                        'yyyy-MM-DD HH:mmA'
                      )}
                    </p>
                  </div>
                )}
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
