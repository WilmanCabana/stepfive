import API from '../../../core/config/api.config.mjs';
import Notify from '../../../core/lib/notify.mjs';
import Requester from '../../../core/services/service/Requester.mjs';

class SpaceRecreationalRequester extends Requester {

    static async getSpaces() {
        const result = await super.get(API.SPACE_RECREATIONAL.ENDPOINTS.SPACE_RECREATIONALS)
        return result.data
    }

    static async getMySpaces() {
        const result = await super.get(API.SPACE_RECREATIONAL.ENDPOINTS.MY_SPACE_RECREATIONALS)
        return result.data
    }

    static async getDiscoverSpaces(filters = {}) {
        const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''))
        const query = params.size ? `?${params.toString()}` : ''
        const result = await super.get(`${API.SPACE_RECREATIONAL.ENDPOINTS.DISCOVER}${query}`)
        return result.data
    }

    static async getSpace(id) {
        const result = await super.get(`${API.SPACE_RECREATIONAL.ENDPOINTS.SPACE_RECREATIONALS}${id}`)
        return result.data
    }

    static async createSpace(space) {
        const result = await super.post(API.SPACE_RECREATIONAL.ENDPOINTS.SPACE_RECREATIONALS, space)

        if (result.message) {
            Notify.notice(result.message || 'No se pudo crear el espacio recreativo', result.ok ? 'info' : 'error')
        }

        return result.data
    }

    static async updateSpace(space) {
        const result = await super.put(`${API.SPACE_RECREATIONAL.ENDPOINTS.SPACE_RECREATIONALS}${space.id}`, space)

        if (result.message) {
            Notify.notice(result.message || 'No se pudo actualizar el espacio recreativo', result.ok ? 'info' : 'error')
        }

        return result.data
    }

    static async deleteSpace(space) {
        const result = await super.delete(`${API.SPACE_RECREATIONAL.ENDPOINTS.SPACE_RECREATIONALS}${space.id}`)

        if (result.message) {
            Notify.notice(result.message || 'No se pudo eliminar el espacio recreativo', result.ok ? 'info' : 'error')
        }

        return result.ok
    }

    static async verifySpace(space, verificationStatus) {
        const result = await super.patch(
            `${API.SPACE_RECREATIONAL.ENDPOINTS.SPACE_RECREATIONALS}${space.id}/verify`,
            { verificationStatus }
        )

        if (result.message) {
            Notify.notice(result.message, result.ok ? 'info' : 'error')
        }

        return result.data
    }

}

export default SpaceRecreationalRequester