import { Repository } from '../../core/decorators/decorators.js'
import BaseRepository from '../../core/orm/repository/Base.repository.js'
import Reservation from '../entities/Reservation.entity.js'

@Repository()
export class ReservationRepository extends BaseRepository<Reservation> {

    constructor() {
        super(Reservation)
    }

    async findOverlapping(spaceId: string, startAt: Date, endAt: Date) {
        const result = await this.db.query(`
            SELECT * FROM "Reservations"
            WHERE "spaceId" = $1
              AND "isDeleted" = FALSE
              AND "status" IN ('pending_payment', 'paid')
              AND "startAt" < $3
              AND "endAt" > $2
        `, [spaceId, startAt, endAt])
        return result.rows as Reservation[]
    }

    async findManyByUserId(userId: string) {
        const reservations = await this.findManyBy('userId', userId, false, { relations: true })
        return reservations.sort((left, right) => new Date(right.startAt).getTime() - new Date(left.startAt).getTime())
    }

    async findManyBySpaceId(spaceId: string) {
        const reservations = await this.findManyBy('spaceId', spaceId, false, { relations: true })
        return reservations.sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime())
    }
}

export default ReservationRepository