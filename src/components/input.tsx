import React, { CSSProperties } from 'react'

export type InputProps = {
  label?: string
  type?: 'text' | 'number'
  value?: string | number
  onChange?: (e: string | number) => void
  style?: CSSProperties
  className?: string
}

const Input = ({ className, value, label, type = 'text', style, onChange }: InputProps) => {
  return (
    <div style={{ width: '100%' }}>
      {/* <label style={{position: 'absolute', left: '20px' }}>{label}</label> */}
      <input
        className={className}
        style={style}
        type={type}
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value)
        }}
      />
    </div>
  )
}

export default Input
