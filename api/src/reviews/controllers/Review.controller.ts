import { Permissions } from '../../core/decorators/auth.decorator.js'
import { Controller } from '../../core/decorators/controller.decorator.js'
import { Inject } from '../../core/decorators/inject.decorator.js'
import { Public } from '../../core/decorators/public.decorator.js'
import { Get, Put } from '../../core/decorators/route.decorator.js'
import Validator from '../../core/utils/Validator.js'
import { REVIEW_PERMISSIONS } from '../constants/authorities.js'
import ReviewService from '../services/Review.service.js'

const toReviewResponse = (review: any) => review ? {
    id: review.id,
    spaceId: review.spaceId,
    userId: review.userId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt
} : null

@Controller('/reviews')
export class ReviewController {

    constructor(
        @Inject(ReviewService)
        private reviewService: ReviewService
    ) { }

    // Público: promedio, total y lista de reseñas del espacio.
    @Get('/space/:spaceId')
    @Public()
    async findBySpace(request, response) {
        const { spaceId } = request.params
        Validator.required({ spaceId }).isUUID({ spaceId })
        const result = await this.reviewService.findBySpace(spaceId)
        return response.status(200).json(result)
    }

    // Mi reseña del espacio y si puedo reseñarlo (con el motivo si no).
    @Get('/space/:spaceId/me')
    @Permissions([REVIEW_PERMISSIONS.READ])
    async findMine(request, response) {
        const { spaceId } = request.params
        Validator.required({ spaceId }).isUUID({ spaceId })
        const result = await this.reviewService.findMine(spaceId, request.user.id)
        return response.status(200).json({ ...result, review: toReviewResponse(result.review) })
    }

    // Crea o actualiza mi reseña: { rating: 1-5, comment?: string }
    @Put('/space/:spaceId')
    @Permissions([REVIEW_PERMISSIONS.CREATE])
    async save(request, response) {
        const { spaceId } = request.params
        Validator.required({ spaceId }).isUUID({ spaceId })
        const review = await this.reviewService.save(spaceId, request.user.id, request.body || {})
        return response.status(200).json(toReviewResponse(review))
    }
}

export default ReviewController
