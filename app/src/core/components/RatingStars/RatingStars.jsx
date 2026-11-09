/* eslint-disable react/prop-types */
import './RatingStars.css'
import { useState } from 'react'

const STARS = [1, 2, 3, 4, 5]

const starIcon = (value, position) => {
    if (value >= position) return { name: 'star', filled: true }
    if (value >= position - 0.5) return { name: 'star_half', filled: true }
    return { name: 'star', filled: false }
}

// Sin onChange: muestra el promedio (estrellas llenas, medias o vacías).
// Con onChange: selector para calificar de 1 a 5.
const RatingStars = ({ value = 0, onChange, size = 'm', disabled = false, className = '' }) => {
    const [hover, setHover] = useState(0)

    if (!onChange) {
        return (
            <span className={`lx-c-rating-stars --${size} ${className}`} aria-hidden='true'>
                {STARS.map(position => {
                    const icon = starIcon(Number(value) || 0, position)
                    return <span key={position} className={`lx-c-rating-star material-symbols-rounded${icon.filled ? ' --filled' : ''}`} translate='no'>{icon.name}</span>
                })}
            </span>
        )
    }

    const shown = hover || value
    return (
        <span className={`lx-c-rating-stars --input --${size} ${className}`} role='radiogroup' aria-label='Calificación' onMouseLeave={() => setHover(0)}>
            {STARS.map(position => (
                <button
                    key={position}
                    type='button'
                    role='radio'
                    aria-checked={value === position}
                    aria-label={`${position} ${position === 1 ? 'estrella' : 'estrellas'}`}
                    className={`lx-c-rating-star material-symbols-rounded${shown >= position ? ' --filled' : ''}`}
                    translate='no'
                    disabled={disabled}
                    onMouseEnter={() => setHover(position)}
                    onFocus={() => setHover(position)}
                    onBlur={() => setHover(0)}
                    onClick={() => onChange(position)}
                >star</button>
            ))}
        </span>
    )
}

export default RatingStars
