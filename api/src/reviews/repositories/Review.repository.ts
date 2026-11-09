import { Repository } from '../../core/decorators/decorators.js'
import BaseRepository from '../../core/orm/repository/Base.repository.js'
import Review from '../entities/Review.entity.js'

export interface RatingSummary {
    ratingAverage: number
    ratingCount: number
}

@Repository()
export class ReviewRepository extends BaseRepository<Review> {

    constructor() {
        super(Review)
    }

    async findByUserAndSpace(userId: string, spaceId: string) {
        const result = await this.db.query(`
            SELECT * FROM "Reviews"
            WHERE "userId" = $1 AND "spaceId" = $2 AND "isDeleted" = FALSE
            LIMIT 1
        `, [userId, spaceId])
        return (result.rows[0] as Review) || null
    }

    // Reseñas de un espacio con el nombre del autor (sin correo ni otros datos personales).
    async findBySpaceWithAuthor(spaceId: string) {
        const result = await this.db.query(`
            SELECT r."id", r."spaceId", r."userId", r."rating", r."comment",
                   r."createdAt", r."updatedAt", u."name" AS "authorName"
            FROM "Reviews" r
            JOIN "Users" u ON u."id" = r."userId"
            WHERE r."spaceId" = $1 AND r."isDeleted" = FALSE
            ORDER BY COALESCE(r."updatedAt", r."createdAt") DESC
        `, [spaceId])
        return result.rows
    }

    // Promedio (un decimal) y total de reseñas por espacio, en una sola consulta.
    async summarize(spaceIds: string[]): Promise<Map<string, RatingSummary>> {
        const summaries = new Map<string, RatingSummary>()
        if (spaceIds.length === 0) return summaries

        const result = await this.db.query(`
            SELECT "spaceId",
                   ROUND(AVG("rating")::numeric, 1)::float AS "ratingAverage",
                   COUNT(*)::int AS "ratingCount"
            FROM "Reviews"
            WHERE "isDeleted" = FALSE AND "spaceId" = ANY($1::uuid[])
            GROUP BY "spaceId"
        `, [spaceIds])

        for (const row of result.rows) {
            summaries.set(row.spaceId, { ratingAverage: row.ratingAverage, ratingCount: row.ratingCount })
        }
        return summaries
    }

    // ¿El usuario tiene al menos una reserva no cancelada en el espacio?
    async hasReservation(userId: string, spaceId: string) {
        const result = await this.db.query(`
            SELECT 1 FROM "Reservations"
            WHERE "userId" = $1 AND "spaceId" = $2
              AND "isDeleted" = FALSE AND "status" <> 'cancelled'
            LIMIT 1
        `, [userId, spaceId])
        return result.rows.length > 0
    }
}

export default ReviewRepository
