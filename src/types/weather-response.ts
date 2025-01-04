export type WeatherResponse = {
  weather: [
    {
      main: string
      description: string
    }
  ]
  main: {
    temp: number
    temp_min: number
    temp_max: number
    humidity: number
  }
  dt: 1736033386
}
