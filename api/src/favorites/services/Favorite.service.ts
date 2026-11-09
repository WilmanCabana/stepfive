import { Inject, Service } from '../../core/decorators/decorators.js'
import { NotFoundError } from '../../core/errors/NotFound.error.js'
import SpaceRecreationalRepository from '../../spaces/repositories/SpaceRecreational.repository.js'
import FavoriteRepository from '../repositories/Favorite.repository.js'

@Service()
export class FavoriteService {

    constructor(
        @Inject(FavoriteRepository)
        private favoriteRepository: FavoriteRepository,
        @Inject(SpaceRecreationalRepository)
        private spaceRepository: SpaceRecreationalRepository
    ) { }

    // Espacios marcados como favoritos por el usuario, del más reciente al más antiguo.
    // Se omiten los espacios eliminados o que ya no están aprobados.
    async findMine(userId: string) {
        const favorites = await this.favoriteRepository.findManyByUserId(userId)
        return favorites
            .map(favorite => favorite.space)
            .filter(space => space && !space.isDeleted && space.verificationStatus === 'approved')
    }

    async add(userId: string, spaceId: string) {
        const space = await this.spaceRepository.findById(spaceId)
        if (!space) throw new NotFoundError('El espacio recreativo no existe')

        const existing = await this.favoriteRepository.findByUserAndSpace(userId, spaceId)
        if (existing) return space

        await this.favoriteRepository.create({ userId, spaceId, createdBy: userId } as any)
        return space
    }

    async remove(userId: string, spaceId: string) {
        await this.favoriteRepository.removeByUserAndSpace(userId, spaceId)
    }
}

export default FavoriteService
