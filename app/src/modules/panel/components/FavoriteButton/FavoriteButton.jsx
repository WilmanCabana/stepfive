/* eslint-disable react/prop-types */
import './FavoriteButton.css'
import { useState } from 'react'
import Icon from '../../../../core/components/Icon/Icon'

const FavoriteButton = ({ active = false, onToggle, className = '' }) => {
    const [busy, setBusy] = useState(false)
    const label = active ? 'Quitar de mis lugares favoritos' : 'Agregar a mis lugares favoritos'

    const handleClick = async (event) => {
        event.stopPropagation()
        if (busy) return
        setBusy(true)
        try { await onToggle() } finally { setBusy(false) }
    }

    return (
        <button
            type='button'
            className={`lx-c-favorite-button${active ? ' --active' : ''} ${className}`}
            aria-pressed={active}
            aria-label={label}
            title={label}
            disabled={busy}
            onClick={handleClick}
        >
            <Icon name='favorite' />
        </button>
    )
}

export default FavoriteButton
