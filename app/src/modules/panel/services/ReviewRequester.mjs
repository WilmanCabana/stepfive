import API from '../../../core/config/api.config.mjs'
import Requester from '../../../core/services/service/Requester.mjs'

const unwrap = (result) => {
    if (!result.ok) throw new Error(result.message || 'No fue posible completar la solicitud')
    return result.data
}

class ReviewRequester extends Requester {
    // { ratingAverage, ratingCount, reviews: [...] }
    static async getSpaceReviews(spaceId) {
        const result = await super.get(`${API.REVIEWS.ENDPOINTS.SPACE}/${spaceId}`)
        return unwrap(result)
    }

    // { review, canReview, reason }
    static async getMyReview(spaceId) {
        const result = await super.get(`${API.REVIEWS.ENDPOINTS.SPACE}/${spaceId}/me`)
        return unwrap(result)
    }

    // Crea o actualiza la reseña propia: { rating, comment }
    static async saveReview(spaceId, review) {
        const result = await super.put(`${API.REVIEWS.ENDPOINTS.SPACE}/${spaceId}`, review)
        return unwrap(result)
    }
}

export default ReviewRequester
