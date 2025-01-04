import React from 'react'

export type ButtonProps = {
  onClick: Function
  children: React.ReactNode
}

const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={() => onClick()}>{children}</button>
}

export default Button
