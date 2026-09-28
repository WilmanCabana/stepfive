import { Permissions } from '../../core/decorators/auth.decorator.js'
import { Controller } from '../../core/decorators/controller.decorator.js'
import { Inject } from '../../core/decorators/inject.decorator.js'
import { Delete, Get, Patch, Post, Put } from '../../core/decorators/route.decorator.js'
import Validator from '../../core/utils/Validator.js'
import { PERMISSIONS } from '../constants/authorities.js'
import SpaceRecreationalDTO from '../dtos/SpaceRecreational.dto.js'
import SpaceRecreationalService from '../services/SpaceRecreational.service.js'

const SPACE_FIELDS = [
    'name', 'type', 'description', 'verificationStatus', 'address', 'neighborhood',
    'commune', 'coordinates', 'referencePoint', 'phone', 'whatsapp', 'email',
    'instagram', 'facebook', 'maxCapacity', 'totalArea', 'bathrooms',
    'hasParking', 'parkingCapacity', 'hasKitchen', 'hasDressingRooms', 'hasShowers',
    'hasLighting', 'hasSound', 'hasStage', 'hasWifi', 'hasGenerator', 'isAccessible',
    'condition', 'pricePerHour', 'paymentMethods',
    'allowsAlcohol', 'allowsFood', 'allowsMusic', 'requiresDeposit', 'depositAmount',
    'openingHours', 'coverImage', 'gallery',
    'fieldType', 'fieldDimensions', 'hasNets', 'hasBalls', 'hasVests', 'seatedCapacity',
    'standingCapacity', 'hasDanceFloor', 'hasFurniture', 'hasVIPArea',
    'reservationMode', 'reservationUnitMinutes'
]

function pickSpaceData(body: any) {
    return Object.fromEntries(
        SPACE_FIELDS
            .filter(field => body?.[field] !== undefined)
            .map(field => [field, body[field]])
    )
}

@Controller('/spaces')
export class SpaceRecreationalController {

    constructor(
        @Inject(SpaceRecreationalService)
        private spaceService: SpaceRecreationalService
    ) { }

    @Get('/')
    @Permissions([PERMISSIONS.SPACE.READ])
    async findAll(request, response) {
        const spaces = await this.spaceService.findAll()
        return response.status(200).json(spaces.map(space => new SpaceRecreationalDTO(space)))
    }

    @Get('/me')
    @Permissions([PERMISSIONS.SPACE.READ])
    async findMine(request, response) {
        const spaces = await this.spaceService.findMySpaces(request.user.id)
        return response.status(200).json(spaces.map(space => new SpaceRecreationalDTO(space)))
    }

    @Get('/:id')
    @Permissions([PERMISSIONS.SPACE.READ])
    async findById(request, response) {
        const { id } = request.params
        Validator.required({ id }).isUUID({ id })
        const space = await this.spaceService.findById(id)
        return response.status(200).json(new SpaceRecreationalDTO(space))
    }

    @Post('/')
    @Permissions([PERMISSIONS.SPACE.CREATE])
    async create(request, response) {
        const space = await this.spaceService.create(pickSpaceData(request.body), request.user.id)
        return response.status(201).json(new SpaceRecreationalDTO(space))
    }

    @Put('/:id')
    @Permissions([PERMISSIONS.SPACE.UPDATE])
    async update(request, response) {
        const { id } = request.params
        Validator.required({ id }).isUUID({ id })
        const space = await this.spaceService.update(id, pickSpaceData(request.body), request.user)
        return response.status(200).json(new SpaceRecreationalDTO(space))
    }

    @Delete('/:id')
    @Permissions([PERMISSIONS.SPACE.DELETE])
    async delete(request, response) {
        const { id } = request.params
        Validator.required({ id }).isUUID({ id })
        await this.spaceService.delete(id, request.user)
        return response.status(200).json({ message: 'Espacio recreativo eliminado correctamente' })
    }

    @Patch('/:id/verify')
    @Permissions([PERMISSIONS.SPACE.VERIFY])
    async verify(request, response) {
        const { id } = request.params
        const { verificationStatus } = request.body || {}
        Validator.required({ id, verificationStatus }).isUUID({ id })
        const space = await this.spaceService.verify(id, verificationStatus, request.user)
        return response.status(200).json(new SpaceRecreationalDTO(space))
    }

}

export default SpaceRecreationalController
