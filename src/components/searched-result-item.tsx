import React from 'react'
import { SearchedResult } from '../types/searched-result'
import moment from 'moment'
import Button from './button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTrash } from '@fortawesome/free-solid-svg-icons'

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
    <div className='d-flex justify-content-between searched-result-item'>
      <div className='searched-result-item-location-time' style={{width: '85%'}}>
        <p>
          {searchedResult.city}, {searchedResult.country}
        </p>
        <p style={{ color: '#FFFFFF66' }}>
          {moment(searchedResult.lastSearchedAt).format('DD-MM-yyyy hh:mmA')}
        </p>
      </div>
      <div className='d-flex gap-2 searched-result-item-buttons'>
        <Button
          className='searched-result-item-button'
          children={
            <FontAwesomeIcon
              icon={faSearch}
              style={{ height: 16, width: 16 }}
            />
          }
          onClick={() => {
            onSearch(index)
          }}
        />
        <Button
          className='searched-result-item-button'
          children={
            <FontAwesomeIcon icon={faTrash} style={{ height: 16, width: 16 }} />
          }
          onClick={() => {
            onDelete(index)
          }}
        />
      </div>
    </div>
  )
}

export default SearchedResultItem
