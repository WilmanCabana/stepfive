import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../core/contexts/AuthContext'
import Notify from '../../../core/lib/notify.mjs'
import FavoriteRequester from '../services/FavoriteRequester.mjs'

export const FAVORITE_AUTHORITIES = {
    permissions: ['ReadFavorites', 'CreateFavorites', 'DeleteFavorites']
}

// Carga los espacios favoritos del usuario y permite marcarlos o desmarcarlos.
const useFavorites = () => {
    const { session, hasAuthorities } = useAuth()
    const canUseFavorites = hasAuthorities(session, FAVORITE_AUTHORITIES)
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(canUseFavorites)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!canUseFavorites) return
        let active = true
        FavoriteRequester.getMyFavorites()
            .then(result => { if (active) setFavorites(result || []) })
            .catch(err => { if (active) setError(err.message || 'No fue posible cargar tus favoritos') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [canUseFavorites])

    const favoriteIds = new Set(favorites.map(space => space.id))

    const toggleFavorite = useCallback(async (space) => {
        const isFavorite = favorites.some(favorite => favorite.id === space.id)
        try {
            if (isFavorite) {
                await FavoriteRequester.removeFavorite(space.id)
                setFavorites(current => current.filter(favorite => favorite.id !== space.id))
                Notify.notice('Espacio quitado de tus lugares favoritos', 'info')
            } else {
                await FavoriteRequester.addFavorite(space.id)
                setFavorites(current => [space, ...current])
                Notify.notice('Espacio agregado a tus lugares favoritos', 'success')
            }
        } catch (err) {
            Notify.notice(err.message || 'No fue posible actualizar tus favoritos', 'error')
        }
    }, [favorites])

    // Actualiza datos de un espacio guardado (por ejemplo, su calificación) sin recargar.
    const updateFavoriteSpace = useCallback((spaceId, changes) => {
        setFavorites(current => current.map(space => space.id === spaceId ? { ...space, ...changes } : space))
    }, [])

    return { canUseFavorites, favorites, favoriteIds, toggleFavorite, updateFavoriteSpace, loading, error }
}

export default useFavorites
