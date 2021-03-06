import React from 'react'

const CustomInput: React.FC<{
    type: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    value: any
    min?: number
    max?: number
}> = ({ type, onChange, value, min, max }) => {
    return (
        <input
            type={type}
            min={min}
            max={max}
            className='transition-colors outline-0 focus:outline-0 p-3 border border-dark focus:border-light'
            onChange={(e) => onChange(e)}
            value={value}
        />
    )
}

export default CustomInput
