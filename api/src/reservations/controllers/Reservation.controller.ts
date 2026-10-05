import { Permissions } from '../../core/decorators/auth.decorator.js'
import { Controller } from '../../core/decorators/controller.decorator.js'
import { Inject } from '../../core/decorators/inject.decorator.js'
import { Get, Patch, Post } from '../../core/decorators/route.decorator.js'
import Validator from '../../core/utils/Validator.js'
import { PERMISSIONS } from '../../spaces/constants/authorities.js'
import ReservationDTO from '../dtos/Reservation.dto.js'
import ReservationService from '../services/Reservation.service.js'

@Controller('/reservations')
export class ReservationController {

    constructor(
        @Inject(ReservationService)
        private reservationService: ReservationService
    ) { }

    @Post('/')
    @Permissions([PERMISSIONS.RESERVATION.CREATE])
    async create(request, response) {
        const reservation = await this.reservationService.create(request.body || {}, request.user)
        return response.status(201).json(new ReservationDTO(reservation))
    }

    @Get('/me')
    @Permissions([PERMISSIONS.RESERVATION.READ])
    async findMine(request, response) {
        const reservations = await this.reservationService.findMine(request.user.id)
        return response.status(200).json(reservations.map(reservation => new ReservationDTO(reservation)))
    }

    @Get('/spaces/me')
    @Permissions([PERMISSIONS.RESERVATION.READ])
    async findMySpaces(request, response) {
        const spaces = await this.reservationService.findMySpaces(request.user.id)
        return response.status(200).json(spaces)
    }

    @Get('/space/:spaceId/availability')
    @Permissions([PERMISSIONS.RESERVATION.READ])
    async availability(request, response) {
        const { spaceId } = request.params
        const { date } = request.query || {}
        const slots = await this.reservationService.availability(spaceId, date)
        return response.status(200).json(slots)
    }

    @Get('/space/:spaceId')
    @Permissions([PERMISSIONS.RESERVATION.READ])
    async findBySpace(request, response) {
        const { spaceId } = request.params
        const reservations = await this.reservationService.findBySpace(spaceId, request.user)
        return response.status(200).json(reservations.map(reservation => new ReservationDTO(reservation)))
    }

    @Patch('/:id/cancel')
    @Permissions([PERMISSIONS.RESERVATION.CANCEL])
    async cancel(request, response) {
        const { id } = request.params
        Validator.required({ id }).isUUID({ id })
        const reservation = await this.reservationService.cancel(id, request.user)
        return response.status(200).json(new ReservationDTO(reservation))
    }

    @Patch('/:id/confirm')
    @Permissions([PERMISSIONS.RESERVATION.READ])
    async confirm(request, response) {
        const { id } = request.params
        const { paymentReference } = request.body || {}
        const reservation = await this.reservationService.confirm(id, paymentReference, request.user)
        return response.status(200).json(new ReservationDTO(reservation))
    }
}

export default ReservationController