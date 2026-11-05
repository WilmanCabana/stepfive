import { Permissions } from '../../core/decorators/auth.decorator.js'
import { Controller } from '../../core/decorators/controller.decorator.js'
import { Inject } from '../../core/decorators/inject.decorator.js'
import { Delete, Get, Post } from '../../core/decorators/route.decorator.js'
import Validator from '../../core/utils/Validator.js'
import SpaceRecreationalDTO from '../../spaces/dtos/SpaceRecreational.dto.js'
import { FAVORITE_PERMISSIONS } from '../constants/authorities.js'
import FavoriteService from '../services/Favorite.service.js'

@Controller('/favorites')
export class FavoriteController {

    constructor(
        @Inject(FavoriteService)
        private favoriteService: FavoriteService
    ) { }

    @Get('/me')
    @Permissions([FAVORITE_PERMISSIONS.READ])
    async findMine(request, response) {
        const spaces = await this.favoriteService.findMine(request.user.id)
        return response.status(200).json(spaces.map(space => new SpaceRecreationalDTO(space)))
    }

    @Post('/:spaceId')
    @Permissions([FAVORITE_PERMISSIONS.CREATE])
    async add(request, response) {
        const { spaceId } = request.params
        Validator.required({ spaceId }).isUUID({ spaceId })
        const space = await this.favoriteService.add(request.user.id, spaceId)
        return response.status(201).json(new SpaceRecreationalDTO(space))
    }

    @Delete('/:spaceId')
    @Permissions([FAVORITE_PERMISSIONS.DELETE])
    async remove(request, response) {
        const { spaceId } = request.params
        Validator.required({ spaceId }).isUUID({ spaceId })
        await this.favoriteService.remove(request.user.id, spaceId)
        return response.status(200).json({ spaceId })
    }
}

export default FavoriteController
