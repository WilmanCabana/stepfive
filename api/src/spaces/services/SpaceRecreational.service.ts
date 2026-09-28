import { Inject, Service } from '../../core/decorators/decorators.js'
import Validator from '../../core/utils/Validator.js'
import { AlreadyExistError } from '../../core/errors/AlreadyExist.error.js'
import { ForbiddenError } from '../../core/errors/Forbidden.error.js'
import { InvalidFormatError } from '../../core/errors/InvalidFormat.error.js'
import { NotFoundError } from '../../core/errors/NotFound.error.js'
import SpaceRecreational from '../entities/SpaceRecreational.entity.js'
import SpaceRecreationalRepository from '../repositories/SpaceRecreational.repository.js'
import { RESERVATION_DEFAULTS, SPACE_CONDITIONS, SPACE_FIELD_TYPES, SPACE_STATUSES, SPACE_TYPES } from '../constants/authorities.js'

const JSON_FIELDS = ['paymentMethods', 'openingHours', 'gallery']
const NUMERIC_FIELDS = [
    'maxCapacity', 'totalArea', 'bathrooms', 'parkingCapacity', 'pricePerHour',
    'depositAmount', 'seatedCapacity', 'standingCapacity', 'reservationUnitMinutes'
]
const BOOLEAN_FIELDS = [
    'hasParking', 'hasKitchen', 'hasDressingRooms', 'hasShowers', 'hasLighting',
    'hasSound', 'hasStage', 'hasWifi', 'hasGenerator', 'isAccessible',
    'allowsAlcohol', 'allowsFood', 'allowsMusic', 'requiresDeposit', 'hasNets',
    'hasBalls', 'hasVests', 'hasDanceFloor', 'hasFurniture', 'hasVIPArea'
]

function openingWindowMinutes(value: unknown) {
    if (typeof value !== 'string') return 0
    const [open, close] = value.split('-', 2)
    const toMinutes = (time: string) => {
        if (!/^\d{2}:\d{2}$/.test(time || '')) return null
        const [hours, minutes] = time.split(':').map(Number)
        if (hours > 23 || minutes > 59) return null
        return hours * 60 + minutes
    }
    const start = toMinutes(open)
    const end = toMinutes(close)
    if (start === null || end === null || start === end) return 0
    return end > start ? end - start : end + 1440 - start
}

function longestOpeningWindow(value: unknown) {
    let parsed = value
    if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed) } catch { return 0 }
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 0

    return Math.max(0, ...Object.values(parsed).map(hours => {
        if (typeof hours === 'string') return openingWindowMinutes(hours)
        if (!hours || typeof hours !== 'object' || hours.available === false) return 0
        return openingWindowMinutes(`${hours.open || ''}-${hours.close || ''}`)
    }))
}

function serializeData(data: Partial<SpaceRecreational>) {
    const serialized = { ...data } as Record<string, any>

    for (const field of JSON_FIELDS) {
        if (serialized[field] !== undefined && typeof serialized[field] !== 'string') {
            serialized[field] = JSON.stringify(serialized[field])
        }
    }

    return serialized
}

@Service()
export class SpaceRecreationalService {

    constructor(
        @Inject(SpaceRecreationalRepository)
        private spaceRepository: SpaceRecreationalRepository
    ) { }

    private validate(data: Partial<SpaceRecreational>, partial = false) {
        if (!partial) {
            this.validateRequired(data)
        }

        if (data.name !== undefined) Validator.length({ name: data.name }, 2, 150)
        if (data.type !== undefined) Validator.isIn({ type: data.type }, SPACE_TYPES)
        if (data.verificationStatus !== undefined) Validator.isIn({ verificationStatus: data.verificationStatus }, SPACE_STATUSES)
        if (data.condition !== undefined) Validator.isIn({ condition: data.condition }, SPACE_CONDITIONS)
        if (data.fieldType !== undefined) Validator.isIn({ fieldType: data.fieldType }, SPACE_FIELD_TYPES)
        if (data.email) Validator.email({ email: data.email })

        for (const field of ['instagram', 'facebook', 'coverImage']) {
            if (data[field] !== undefined && data[field] !== '') Validator.url({ [field]: data[field] })
        }

        for (const field of NUMERIC_FIELDS) {
            if (data[field] !== undefined && (typeof data[field] !== 'number' || Number.isNaN(data[field]) || data[field] < 0)) {
                Validator.isNumeric({ [field]: data[field] })
            }
        }

        for (const field of BOOLEAN_FIELDS) {
            if (data[field] !== undefined) Validator.isBoolean({ [field]: data[field] })
        }

        if (data.reservationMode !== undefined) Validator.isIn({ reservationMode: data.reservationMode }, ['hourly', 'block'])
        if (data.reservationUnitMinutes !== undefined) {
            Validator.isInteger({ reservationUnitMinutes: data.reservationUnitMinutes })
            if (data.reservationUnitMinutes <= 0) throw new InvalidFormatError('La unidad de reserva debe ser mayor a cero')
        }

        const paymentMethods = (data as any).paymentMethods
        const gallery = (data as any).gallery
        if (paymentMethods !== undefined) {
            Validator.isArray({ paymentMethods })
            paymentMethods.forEach(method => Validator.isIn({ paymentMethod: method }, ['cash', 'pse']))
        }
        if (gallery !== undefined) Validator.isArray({ gallery })
    }

    private validateRequired(data: Partial<SpaceRecreational>) {
        Validator.required({
            name: data.name,
            type: data.type,
            address: data.address,
            phone: data.phone,
            openingHours: longestOpeningWindow(data.openingHours) > 0 ? data.openingHours : '',
            pricePerHour: data.pricePerHour
        })
    }

    private validateReservationWindow(data: Partial<SpaceRecreational>) {
        const requiredMinutes = data.type === 'synthetic_field' ? 60 : data.reservationUnitMinutes
        if (!requiredMinutes || requiredMinutes <= 0) {
            throw new InvalidFormatError('La duración del bloque debe ser mayor a cero')
        }
        if (longestOpeningWindow(data.openingHours) >= requiredMinutes) return

        if (data.type === 'event_hall') {
            throw new InvalidFormatError(`La duración del bloque (${requiredMinutes / 60}h) no cabe en ningún día de atención configurado`)
        }
        throw new InvalidFormatError('Debe haber al menos un día de atención con una ventana de mínimo 60 minutos')
    }

    private isOwner(space: SpaceRecreational, actor: any) {
        return space.ownerId === actor?.id
    }

    private canManage(space: SpaceRecreational, actor: any) {
        return actor?.roles?.includes('Admin') || this.isOwner(space, actor)
    }

    async create(data: Partial<SpaceRecreational>, ownerId: string) {
        const reservationDefaults = RESERVATION_DEFAULTS[data.type] || RESERVATION_DEFAULTS.synthetic_field
        const normalizedData = {
            ...data,
            reservationMode: reservationDefaults.reservationMode,
            reservationUnitMinutes: data.type === 'synthetic_field'
                ? 60
                : data.reservationUnitMinutes ?? reservationDefaults.reservationUnitMinutes
        }
        this.validate(normalizedData)
        this.validateReservationWindow(normalizedData)

        const existing = await this.spaceRepository.findOneBy('name', data.name)
        if (existing && existing.ownerId === ownerId) {
            throw new AlreadyExistError(`Ya tienes un espacio registrado con el nombre "${data.name}"`)
        }

        const entity = serializeData({
            ...normalizedData,
            ownerId,
            verificationStatus: normalizedData.verificationStatus || 'pending',
        })

        delete entity.owner
        return this.spaceRepository.create(entity)
    }

    async update(id: string, data: Partial<SpaceRecreational>, actor: any) {
        const space = await this.findById(id)
        if (!this.canManage(space, actor)) throw new ForbiddenError('Solo el propietario o un administrador puede editar este espacio')

        this.validate(data, true)
        delete (data as any).ownerId
        delete (data as any).owner
        if (!actor?.roles?.includes('Admin')) delete (data as any).verificationStatus

        const nextType = data.type || space.type
        const reservationDefaults = RESERVATION_DEFAULTS[nextType]
        const typeChanged = data.type !== undefined && data.type !== space.type
        data.reservationMode = reservationDefaults.reservationMode
        data.reservationUnitMinutes = nextType === 'synthetic_field'
            ? 60
            : data.reservationUnitMinutes ?? (typeChanged ? reservationDefaults.reservationUnitMinutes : space.reservationUnitMinutes ?? reservationDefaults.reservationUnitMinutes)
        this.validate(data, true)
        const updatedSpace = { ...space, ...data, type: nextType }
        this.validateRequired(updatedSpace)
        this.validateReservationWindow(updatedSpace)

        return this.spaceRepository.update(id, serializeData(data))
    }

    async findById(id: string) {
        const space = await this.spaceRepository.findById(id)
        if (!space) throw new NotFoundError('El espacio recreativo no existe')
        return space
    }

    async findAll() {
        return this.spaceRepository.findAll()
    }

    async findMySpaces(ownerId: string) {
        return this.spaceRepository.findManyBy('ownerId', ownerId)
    }

    async delete(id: string, actor: any) {
        const space = await this.findById(id)
        if (!this.canManage(space, actor)) throw new ForbiddenError('Solo el propietario o un administrador puede eliminar este espacio')
        await this.spaceRepository.delete(id, actor.id)
    }

    async verify(id: string, verificationStatus: string, actor: any) {
        if (!actor?.roles?.includes('Admin') && !actor?.permissions?.includes('VerifySpaces')) {
            throw new ForbiddenError('Solo un usuario autorizado puede verificar espacios')
        }
        Validator.isIn({ verificationStatus }, ['approved', 'rejected'])
        await this.findById(id)
        return this.spaceRepository.update(id, { verificationStatus })
    }
}

export default SpaceRecreationalService
