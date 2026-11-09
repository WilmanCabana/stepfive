/* eslint-disable react/prop-types */
import './RatingSummary.css'
import RatingStars from '../RatingStars/RatingStars'

export const formatRating = (value) => (Number(value) || 0).toFixed(1)

// compact (tarjetas): ★ 4.0 (127)   ·   full (detalle): 4.0 ★★★★☆ (127)
// Sin reseñas no muestra nada. Con onClick, la versión compacta es un botón (p. ej. "Ver reseñas").
const RatingSummary = ({ average = 0, count = 0, variant = 'compact', onClick, className = '' }) => {
    const total = Number(count) || 0
    if (total === 0) return null

    const label = `Calificación ${formatRating(average)} de 5, ${total} ${total === 1 ? 'reseña' : 'reseñas'}`

    if (variant === 'full') {
        return (
            <div className={`lx-c-rating-summary --full ${className}`} role='img' aria-label={label}>
                <strong>{formatRating(average)}</strong>
                <RatingStars value={average} size='l' />
                <span>({total})</span>
            </div>
        )
    }

    const content = <>
        <span className='lx-c-rating-summary-star material-symbols-rounded' translate='no' aria-hidden='true'>star</span>
        <strong aria-hidden='true'>{formatRating(average)}</strong>
        <span aria-hidden='true'>({total})</span>
    </>

    if (onClick) {
        return (
            <button
                type='button'
                className={`lx-c-rating-summary --compact --clickable ${className}`}
                aria-label={`${label}. Ver reseñas`}
                title='Ver reseñas'
                onClick={(event) => { event.stopPropagation(); onClick() }}
            >{content}</button>
        )
    }

    return <span className={`lx-c-rating-summary --compact ${className}`} role='img' aria-label={label}>{content}</span>
}

export default RatingSummary
