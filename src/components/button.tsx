import React, { CSSProperties } from 'react'

export type ButtonProps = {
  onClick: Function
  children: React.ReactNode
  style?: CSSProperties
  className?: string
}

const Button = ({ children, style, className, onClick }: ButtonProps) => {
  return <button className={className} onClick={() => onClick()} style={style}>{children}</button>
}

export default Button
