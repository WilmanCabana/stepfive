import { Inject, Service } from '../../core/decorators/decorators.js'
import { ForbiddenError } from '../../core/errors/Forbidden.error.js'
import { InvalidFormatError } from '../../core/errors/InvalidFormat.error.js'
import { NotFoundError } from '../../core/errors/NotFound.error.js'
import SpaceRecreationalRepository from '../../spaces/repositories/SpaceRecreational.repository.js'
import { REVIEW_RULES } from '../constants/authorities.js'
import ReviewRepository from '../repositories/Review.repository.js'

const EMPTY_SUMMARY = { ratingAverage: 0, ratingCount: 0 }

@Service()
export class ReviewService {

    constructor(
        @Inject(ReviewRepository)
        private reviewRepository: ReviewRepository,
        @Inject(SpaceRecreationalRepository)
        private spaceRepository: SpaceRecreationalRepository
    ) { }

    private async findApprovedSpace(spaceId: string) {
        const space = await this.spaceRepository.findById(spaceId)
        if (!space || space.verificationStatus !== 'approved') {
            throw new NotFoundError('El espacio recreativo no existe')
        }
        return space
    }

    // Por qué un usuario no puede reseñar; null si sí puede.
    private async reviewBlocker(userId: string, space: any) {
        if (space.ownerId === userId) return 'No puedes reseñar tu propio espacio'
        const hasReservation = await this.reviewRepository.hasReservation(userId, space.id)
        if (!hasReservation) return 'Reserva este espacio para poder dejar tu reseña'
        // Más adelante: exigir que la reserva ya haya terminado.
        return null
    }

    private validate(data: any) {
        const rating = Number(data?.rating)
        if (!Number.isInteger(rating) || rating < REVIEW_RULES.MIN_RATING || rating > REVIEW_RULES.MAX_RATING) {
            throw new InvalidFormatError(`La calificación debe ser un número entero entre ${REVIEW_RULES.MIN_RATING} y ${REVIEW_RULES.MAX_RATING}`)
        }

        const rawComment = data?.comment
        if (rawComment !== undefined && rawComment !== null && typeof rawComment !== 'string') {
            throw new InvalidFormatError('El comentario debe ser texto')
        }
        const comment = typeof rawComment === 'string' && rawComment.trim() !== '' ? rawComment.trim() : null
        if (comment && comment.length > REVIEW_RULES.MAX_COMMENT_LENGTH) {
            throw new InvalidFormatError(`El comentario no puede superar ${REVIEW_RULES.MAX_COMMENT_LENGTH} caracteres`)
        }
        return { rating, comment }
    }

    // Agrega ratingAverage y ratingCount a cada espacio (0 y 0 si no tiene reseñas).
    async attachRatings<T extends { id?: string }>(spaces: T[]) {
        const summaries = await this.reviewRepository.summarize(spaces.map(space => space.id).filter(Boolean))
        return spaces.map(space => ({ ...space, ...(summaries.get(space.id) || EMPTY_SUMMARY) }))
    }

    async findBySpace(spaceId: string) {
        await this.findApprovedSpace(spaceId)
        const [reviews, summaries] = await Promise.all([
            this.reviewRepository.findBySpaceWithAuthor(spaceId),
            this.reviewRepository.summarize([spaceId])
        ])
        return { ...(summaries.get(spaceId) || EMPTY_SUMMARY), reviews }
    }

    async findMine(spaceId: string, userId: string) {
        const space = await this.findApprovedSpace(spaceId)
        const [review, blocker] = await Promise.all([
            this.reviewRepository.findByUserAndSpace(userId, spaceId),
            this.reviewBlocker(userId, space)
        ])
        return { review, canReview: blocker === null, reason: blocker }
    }

    // Crea la reseña del usuario o la actualiza si ya existe (una por usuario y espacio).
    async save(spaceId: string, userId: string, data: any) {
        const space = await this.findApprovedSpace(spaceId)
        const blocker = await this.reviewBlocker(userId, space)
        if (blocker) throw new ForbiddenError(blocker)

        const { rating, comment } = this.validate(data)
        const existing = await this.reviewRepository.findByUserAndSpace(userId, spaceId)
        if (existing) {
            return this.reviewRepository.update(existing.id, { rating, comment, updatedBy: userId } as any)
        }
        return this.reviewRepository.create({ spaceId, userId, rating, comment, createdBy: userId } as any)
    }
}

export default ReviewService
