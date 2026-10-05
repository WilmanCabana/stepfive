import DTO from '../../core/orm/dto/Base.dto.js'
import Reservation from '../entities/Reservation.entity.js'

export class ReservationDTO extends DTO<Reservation> {
    constructor(entity: Partial<Reservation>) {
        const reservation = entity as any
        super({
            id: reservation.id,
            spaceId: reservation.spaceId,
            userId: reservation.userId,
            startAt: reservation.startAt,
            endAt: reservation.endAt,
            totalPrice: reservation.totalPrice,
            status: reservation.status,
            paymentMethod: reservation.paymentMethod,
            paymentReference: reservation.paymentReference,
            notes: reservation.notes,
            createdAt: reservation.createdAt,
            updatedAt: reservation.updatedAt,
            space: reservation.space ? { ...reservation.space } : undefined,
            user: reservation.user ? {
                id: reservation.user.id,
                name: reservation.user.name,
                phoneNumber: reservation.user.phoneNumber
            } : undefined
        } as any)
    }
}

export default ReservationDTO