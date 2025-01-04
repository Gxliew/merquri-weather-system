import React from 'react'
import { SearchedResult } from '../types/searched-result'
import moment from 'moment'

export type SearchedResultItemProps = {
  searchedResult: SearchedResult
  index: number
}

const SearchedResultItem = ({
  searchedResult,
  index
}: SearchedResultItemProps) => {
  return (
    <div className='d-flex justify-content-between'>
      <p>
        {index + 1}. {searchedResult.city}, {searchedResult.country}
      </p>
      <p>{moment(searchedResult.lastSearchedAt).format('hh:mm:ssA')}</p>
    </div>
  )
}

export default SearchedResultItem
