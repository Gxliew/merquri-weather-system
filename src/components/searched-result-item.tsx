import React from 'react'
import { SearchedResult } from '../types/searched-result'
import moment from 'moment'
import Button from './button'

export type SearchedResultItemProps = {
  searchedResult: SearchedResult
  index: number
  onSearch: (index: number) => void
  onDelete: (index: number) => void
}

const SearchedResultItem = ({
  searchedResult,
  index,
  onSearch,
  onDelete
}: SearchedResultItemProps) => {
  return (
    <div className='d-flex justify-content-between'>
      <p>
        {index + 1}. {searchedResult.city}, {searchedResult.country}
      </p>
      <div className='d-flex gap-2'>
        <p>{moment(searchedResult.lastSearchedAt).format('hh:mm:ssA')}</p>
        <Button
          children={<p>Search</p>}
          onClick={() => {
            onSearch(index)
          }}
        />
        <Button
          children={<p>Delete</p>}
          onClick={() => {
            onDelete(index)
          }}
        />
      </div>
    </div>
  )
}

export default SearchedResultItem
