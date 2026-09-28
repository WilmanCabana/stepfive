import User from '../../auth/entities/User.entity.js'
import { Entity, Id, Column, ManyToOne } from '../../core/orm/decorators/decorators.js'

@Entity('SpaceRecreationals')
export class SpaceRecreational {

    @Id()
    id: string

    @Column({ type: 'string', nullable: false })
    name: string

    @Column({ type: 'string', nullable: false })
    type: string

    @Column({ type: 'text' })
    description: string

    @Column({ type: 'string', nullable: false, default: 'pending' })
    verificationStatus: string

    @Column({ type: 'string', nullable: false })
    address: string

    @Column({ type: 'string' })
    neighborhood: string

    @Column({ type: 'string' })
    commune: string

    @Column({ type: 'string' })
    coordinates: string

    @Column({ type: 'string' })
    referencePoint: string

    @Column({ type: 'string', nullable: false })
    phone: string

    @Column({ type: 'string' })
    whatsapp: string

    @Column({ type: 'string' })
    email: string

    @Column({ type: 'string' })
    instagram: string

    @Column({ type: 'string' })
    facebook: string

    @Column({ type: 'number' })
    maxCapacity: number

    @Column({ type: 'number' })
    totalArea: number

    @Column({ type: 'number' })
    bathrooms: number

    @Column({ type: 'boolean', nullable: false, default: false })
    hasParking: boolean

    @Column({ type: 'number' })
    parkingCapacity: number

    @Column({ type: 'boolean', nullable: false, default: false })
    hasKitchen: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasDressingRooms: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasShowers: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasLighting: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasSound: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasStage: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasWifi: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasGenerator: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    isAccessible: boolean

    @Column({ type: 'string' })
    condition: string

    @Column({ type: 'number' })
    pricePerHour: number

    @Column({ type: 'text' })
    paymentMethods: string

    @Column({ type: 'boolean', nullable: false, default: false })
    allowsAlcohol: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    allowsFood: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    allowsMusic: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    requiresDeposit: boolean

    @Column({ type: 'number' })
    depositAmount: number

    @Column({ type: 'text' })
    openingHours: string

    @Column({ type: 'string', nullable: false, default: 'hourly' })
    reservationMode: 'hourly' | 'block'

    @Column({ type: 'number', nullable: false, default: 60 })
    reservationUnitMinutes: number

    @Column({ type: 'string' })
    coverImage: string

    @Column({ type: 'text' })
    gallery: string

    @Column({ type: 'string' })
    fieldType: string

    @Column({ type: 'string' })
    fieldDimensions: string

    @Column({ type: 'boolean', nullable: false, default: false })
    hasNets: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasBalls: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasVests: boolean

    @Column({ type: 'number' })
    seatedCapacity: number

    @Column({ type: 'number' })
    standingCapacity: number

    @Column({ type: 'boolean', nullable: false, default: false })
    hasDanceFloor: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasFurniture: boolean

    @Column({ type: 'boolean', nullable: false, default: false })
    hasVIPArea: boolean

    @ManyToOne(() => User, {
        inverse: 'ownerId',
        joinColumn: 'ownerId',
        owner: true,
        eager: true
    })
    owner: User

    ownerId: string
    status: string
    isActive: boolean
    isDeleted: boolean
    createdAt: Date
    createdBy: string
    updatedAt: Date
    updatedBy: string
    deletedAt: Date
    deletedBy: string
}

export default SpaceRecreational
