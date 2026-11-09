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

    async createBatch(entities: Partial<Reservation>[]) {
        const client = await this.db.pool.connect()
        try {
            await client.query('BEGIN')
            const values: unknown[] = []
            const rows = entities.map((entity, index) => {
                const offset = index * 9
                values.push(
                    entity.spaceId,
                    entity.userId,
                    entity.startAt,
                    entity.endAt,
                    entity.totalPrice,
                    entity.status,
                    entity.paymentMethod,
                    entity.paymentReference,
                    entity.notes
                )
                return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`
            })
            const result = await client.query(`
                INSERT INTO "Reservations" (
                    "spaceId", "userId", "startAt", "endAt", "totalPrice",
                    "status", "paymentMethod", "paymentReference", "notes"
                )
                VALUES ${rows.join(', ')}
                RETURNING *
            `, values)
            await client.query('COMMIT')
            return result.rows as Reservation[]
        } catch (error) {
            await client.query('ROLLBACK')
            throw error
        } finally {
            client.release()
        }
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