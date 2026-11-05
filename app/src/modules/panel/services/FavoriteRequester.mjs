import API from '../../../core/config/api.config.mjs'
import Requester from '../../../core/services/service/Requester.mjs'

const unwrap = (result) => {
    if (!result.ok) throw new Error(result.message || 'No fue posible completar la solicitud')
    return result.data
}

class FavoriteRequester extends Requester {
    static async getMyFavorites() {
        const result = await super.get(API.FAVORITES.ENDPOINTS.ME)
        return unwrap(result)
    }

    static async addFavorite(spaceId) {
        const result = await super.post(`${API.FAVORITES.ENDPOINTS.ALL}${spaceId}`, {})
        return unwrap(result)
    }

    static async removeFavorite(spaceId) {
        const result = await super.delete(`${API.FAVORITES.ENDPOINTS.ALL}${spaceId}`)
        return unwrap(result)
    }
}

export default FavoriteRequester
