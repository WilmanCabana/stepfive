import { Repository } from '../../core/decorators/decorators.js'
import BaseRepository from '../../core/orm/repository/Base.repository.js'
import Favorite from '../entities/Favorite.entity.js'

@Repository()
export class FavoriteRepository extends BaseRepository<Favorite> {

    constructor() {
        super(Favorite)
    }

    async findByUserAndSpace(userId: string, spaceId: string) {
        const result = await this.db.query(`
            SELECT * FROM "Favorites"
            WHERE "userId" = $1 AND "spaceId" = $2 AND "isDeleted" = FALSE
            LIMIT 1
        `, [userId, spaceId])
        return (result.rows[0] as Favorite) || null
    }

    async findManyByUserId(userId: string) {
        const favorites = await this.findManyBy('userId', userId, false, { relations: ['space'] })
        return favorites.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    }

    async removeByUserAndSpace(userId: string, spaceId: string) {
        await this.db.query(`
            DELETE FROM "Favorites"
            WHERE "userId" = $1 AND "spaceId" = $2
        `, [userId, spaceId])
    }
}

export default FavoriteRepository
