import API from '../../../core/config/api.config.mjs'
import Requester from '../../../core/services/service/Requester.mjs'

const unwrap = (result) => {
    if (!result.ok) throw new Error(result.message || 'No fue posible completar la solicitud')
    return result.data
}

class ReservationRequester extends Requester {
    static async getAvailability(spaceId, date) {
        const result = await super.get(`${API.RESERVATIONS.ENDPOINTS.SPACE}/${spaceId}/availability`, { params: { date } })
        return unwrap(result)
    }

    static async createReservation(data) {
        const result = await super.post(API.RESERVATIONS.ENDPOINTS.ALL, data)
        return unwrap(result)
    }

    static async getMyReservations() {
        const result = await super.get(API.RESERVATIONS.ENDPOINTS.ME)
        return unwrap(result)
    }

    static async getMySpaces() {
        const result = await super.get(`${API.RESERVATIONS.ENDPOINTS.SPACES}/me`)
        return unwrap(result)
    }

    static async getSpaceReservations(spaceId) {
        const result = await super.get(`${API.RESERVATIONS.ENDPOINTS.SPACE}/${spaceId}`)
        return unwrap(result)
    }

    static async cancelReservation(id) {
        const result = await super.patch(`${API.RESERVATIONS.ENDPOINTS.ALL}${id}/cancel`, {})
        return unwrap(result)
    }
}

export default ReservationRequester