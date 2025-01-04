import React from 'react'

export type InputProps = {
  label?: string
  type?: 'text' | 'number'
  value?: string | number
  onChange?: (e: string | number) => void
}

const Input = ({ value, label, type = 'text', onChange }: InputProps) => {
  return (
    <>
      {label && <p>{label}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value)
        }}
      />
    </>
  )
}

export default Input
