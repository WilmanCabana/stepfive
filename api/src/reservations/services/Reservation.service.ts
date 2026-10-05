import { Inject, Service } from '../../core/decorators/decorators.js'
import { AlreadyExistError } from '../../core/errors/AlreadyExist.error.js'
import { ForbiddenError } from '../../core/errors/Forbidden.error.js'
import { InvalidFormatError } from '../../core/errors/InvalidFormat.error.js'
import { NotFoundError } from '../../core/errors/NotFound.error.js'
import Validator from '../../core/utils/Validator.js'
import SpaceRecreational from '../../spaces/entities/SpaceRecreational.entity.js'
import SpaceRecreationalRepository from '../../spaces/repositories/SpaceRecreational.repository.js'
import Reservation from '../entities/Reservation.entity.js'
import ReservationRepository from '../repositories/Reservation.repository.js'

const ACTIVE_STATUSES = ['pending_payment', 'paid']
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const BOGOTA_TIME_ZONE = 'America/Bogota'

function localDateKey(date: Date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: BOGOTA_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date)
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
    return `${values.year}-${values.month}-${values.day}`
}

function startOfLocalDate(dateKey: string) {
    return new Date(`${dateKey}T00:00:00-05:00`)
}

function openingHoursFor(space: SpaceRecreational, dateKey: string) {
    let openingHours: any = space.openingHours
    if (typeof openingHours === 'string') {
        try { openingHours = JSON.parse(openingHours) } catch { return null }
    }
    if (!openingHours || typeof openingHours !== 'object' || Array.isArray(openingHours)) return null

    const weekday = new Date(`${dateKey}T12:00:00-05:00`).getUTCDay()
    const dayHours = openingHours[DAY_KEYS[weekday]]
    if (typeof dayHours !== 'string') {
        if (!dayHours || typeof dayHours !== 'object' || dayHours.available === false) return null
        return parseWindow(`${dayHours.open || ''}-${dayHours.close || ''}`)
    }
    return parseWindow(dayHours)
}

function parseWindow(value: string) {
    const [open, close] = value.split('-', 2)
    const parseTime = (time: string) => {
        if (!/^\d{2}:\d{2}$/.test(time || '')) return null
        const [hours, minutes] = time.split(':').map(Number)
        if (hours > 23 || minutes > 59) return null
        return hours * 60 + minutes
    }
    const openMinute = parseTime(open)
    let closeMinute = parseTime(close)
    if (openMinute === null || closeMinute === null || openMinute === closeMinute) return null
    if (closeMinute < openMinute) closeMinute += 1440
    return { openMinute, closeMinute }
}

function minuteDate(dateKey: string, minute: number) {
    return new Date(startOfLocalDate(dateKey).getTime() + minute * 60_000)
}

function formatMinute(minute: number) {
    const normalized = minute % 1440
    return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

function parseDateTime(value: unknown, field: string) {
    if (typeof value !== 'string' || value.trim() === '') throw new InvalidFormatError(`${field} debe ser una fecha y hora válida`)
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) throw new InvalidFormatError(`${field} debe ser una fecha y hora válida`)
    return parsed
}

function parseDateKey(value: unknown) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new InvalidFormatError('date debe tener el formato YYYY-MM-DD')
    }
    const parsed = new Date(`${value}T12:00:00-05:00`)
    if (Number.isNaN(parsed.getTime()) || localDateKey(parsed) !== value) {
        throw new InvalidFormatError('date no corresponde a una fecha válida')
    }
    return value
}

@Service()
export class ReservationService {

    constructor(
        @Inject(ReservationRepository)
        private reservationRepository: ReservationRepository,
        @Inject(SpaceRecreationalRepository)
        private spaceRepository: SpaceRecreationalRepository
    ) { }

    private isAdmin(actor: any) {
        return actor?.roles?.includes('Admin')
    }

    private async getSpace(spaceId: string) {
        const space = await this.spaceRepository.findById(spaceId)
        if (!space) throw new NotFoundError('El espacio recreativo no existe')
        if (space.verificationStatus !== 'approved') throw new ForbiddenError('Este espacio no está disponible para reservas')
        return space
    }

    private getPrice(space: SpaceRecreational, durationMinutes: number) {
        const unitMinutes = Number(space.reservationUnitMinutes)
        const units = durationMinutes / unitMinutes
        return Number(space.pricePerHour) * (space.reservationMode === 'block' ? units : durationMinutes / 60)
    }

    private validateWindow(space: SpaceRecreational, startAt: Date, endAt: Date) {
        const dateKey = localDateKey(startAt)
        const window = openingHoursFor(space, dateKey)
        if (!window) throw new InvalidFormatError('El espacio no tiene horario disponible para ese día')

        const dayStart = startOfLocalDate(dateKey)
        const startMinute = (startAt.getTime() - dayStart.getTime()) / 60_000
        const endMinute = (endAt.getTime() - dayStart.getTime()) / 60_000
        const durationMinutes = (endAt.getTime() - startAt.getTime()) / 60_000
        const unitMinutes = Number(space.reservationUnitMinutes)

        if (startMinute < window.openMinute || endMinute > window.closeMinute) {
            throw new InvalidFormatError('La reserva debe estar dentro del horario de atención')
        }
        if (!Number.isInteger(durationMinutes) || durationMinutes <= 0 || !Number.isInteger(unitMinutes) || unitMinutes <= 0) {
            throw new InvalidFormatError('La duración de la reserva no es válida')
        }
        if (durationMinutes % unitMinutes !== 0 || (startMinute - window.openMinute) % unitMinutes !== 0) {
            throw new InvalidFormatError(`La reserva debe respetar bloques de ${unitMinutes} minutos`)
        }
        return durationMinutes
    }

    async create(data: any, actor: any) {
        const { spaceId } = data || {}
        Validator.required({ spaceId, startAt: data?.startAt, endAt: data?.endAt })
        Validator.isUUID({ spaceId })
        if (!actor?.id) throw new ForbiddenError('Debes iniciar sesión para reservar')

        const startAt = parseDateTime(data.startAt, 'startAt')
        const endAt = parseDateTime(data.endAt, 'endAt')
        if (endAt <= startAt) throw new InvalidFormatError('endAt debe ser posterior a startAt')

        const space = await this.getSpace(spaceId)
        if (space.ownerId === actor.id) throw new ForbiddenError('No puedes reservar tu propio espacio')
        const durationMinutes = this.validateWindow(space, startAt, endAt)
        if (data.notes !== undefined && data.notes !== null && String(data.notes).length > 2000) {
            throw new InvalidFormatError('Las notas no pueden superar 2000 caracteres')
        }
        if ((await this.reservationRepository.findOverlapping(spaceId, startAt, endAt)).length > 0) {
            throw new AlreadyExistError('La franja seleccionada ya está reservada')
        }

        const entity: Partial<Reservation> = {
            spaceId,
            userId: actor.id,
            startAt,
            endAt,
            totalPrice: this.getPrice(space, durationMinutes),
            status: 'paid',
            paymentMethod: 'pse',
            paymentReference: `manual-${Date.now()}`,
            notes: data.notes ? String(data.notes).trim() : null
        }

        try {
            const created = await this.reservationRepository.create(entity)
            return this.reservationRepository.findById(created.id, false, { relations: true })
        } catch (error: any) {
            if (error?.code === '23P01') throw new AlreadyExistError('La franja seleccionada ya está reservada')
            throw error
        }
    }

    async findMine(userId: string) {
        return this.reservationRepository.findManyByUserId(userId)
    }

    async findMySpaces(userId: string) {
        const spaces = await this.spaceRepository.findManyBy('ownerId', userId)
        return spaces.map(space => ({
            id: space.id,
            name: space.name,
            type: space.type,
            address: space.address,
            commune: space.commune,
            coverImage: space.coverImage,
            verificationStatus: space.verificationStatus,
            reservationMode: space.reservationMode,
            reservationUnitMinutes: space.reservationUnitMinutes
        }))
    }

    async findBySpace(spaceId: string, actor: any) {
        Validator.isUUID({ spaceId })
        const space = await this.spaceRepository.findById(spaceId)
        if (!space) throw new NotFoundError('El espacio recreativo no existe')
        if (!this.isAdmin(actor) && space.ownerId !== actor?.id) {
            throw new ForbiddenError('Solo el propietario o un administrador puede consultar estas reservas')
        }
        return this.reservationRepository.findManyBySpaceId(spaceId)
    }

    async availability(spaceId: string, date: unknown) {
        Validator.isUUID({ spaceId })
        const dateKey = parseDateKey(date)
        const space = await this.getSpace(spaceId)
        const window = openingHoursFor(space, dateKey)
        if (!window) return []

        const unitMinutes = Number(space.reservationUnitMinutes)
        if (!Number.isInteger(unitMinutes) || unitMinutes <= 0) throw new InvalidFormatError('La duración del bloque no es válida')
        const windowStart = minuteDate(dateKey, window.openMinute)
        const windowEnd = minuteDate(dateKey, window.closeMinute)
        const blockingReservations = await this.reservationRepository.findOverlapping(spaceId, windowStart, windowEnd)
        const slots = []

        for (let startMinute = window.openMinute; startMinute + unitMinutes <= window.closeMinute; startMinute += unitMinutes) {
            const endMinute = startMinute + unitMinutes
            const startAt = minuteDate(dateKey, startMinute)
            const endAt = minuteDate(dateKey, endMinute)
            const overlaps = blockingReservations.some(reservation =>
                new Date(reservation.startAt).getTime() < endAt.getTime()
                && new Date(reservation.endAt).getTime() > startAt.getTime()
            )
            if (!overlaps) slots.push({
                startAt: startAt.toISOString(),
                endAt: endAt.toISOString(),
                label: `${formatMinute(startMinute)} - ${formatMinute(endMinute)}`,
                totalPrice: this.getPrice(space, unitMinutes)
            })
        }

        return slots
    }

    async cancel(id: string, actor: any) {
        const reservation = await this.reservationRepository.findById(id)
        if (!reservation) throw new NotFoundError('La reserva no existe')
        if (!this.isAdmin(actor) && reservation.userId !== actor?.id) {
            throw new ForbiddenError('Solo puedes cancelar tus propias reservas')
        }
        if (!ACTIVE_STATUSES.includes(reservation.status)) throw new InvalidFormatError('Esta reserva ya no se puede cancelar')
        await this.reservationRepository.update(id, { status: 'cancelled' })
        return this.reservationRepository.findById(id, false, { relations: true })
    }

    async confirm(id: string, paymentReference: string, actor: any) {
        if (!this.isAdmin(actor)) throw new ForbiddenError('Solo un administrador o la pasarela de pago puede confirmar una reserva')
        Validator.required({ id, paymentReference }).isUUID({ id })
        const reservation = await this.reservationRepository.findById(id)
        if (!reservation) throw new NotFoundError('La reserva no existe')
        if (reservation.status !== 'pending_payment') throw new InvalidFormatError('La reserva no está pendiente de pago')
        await this.reservationRepository.update(id, { status: 'paid', paymentReference })
        return this.reservationRepository.findById(id, false, { relations: true })
    }
}

export default ReservationService