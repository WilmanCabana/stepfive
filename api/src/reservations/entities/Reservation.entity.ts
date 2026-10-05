import User from '../../auth/entities/User.entity.js'
import { Entity, Id, Column, ManyToOne } from '../../core/orm/decorators/decorators.js'
import SpaceRecreational from '../../spaces/entities/SpaceRecreational.entity.js'

@Entity('Reservations')
export class Reservation {

    @Id()
    id: string

    @ManyToOne(() => SpaceRecreational, {
        joinColumn: 'spaceId',
        owner: true,
        eager: true
    })
    space: SpaceRecreational

    spaceId: string

    @ManyToOne(() => User, {
        joinColumn: 'userId',
        owner: true,
        eager: true
    })
    user: User

    userId: string

    @Column({ type: 'date', nullable: false })
    startAt: Date

    @Column({ type: 'date', nullable: false })
    endAt: Date

    @Column({ type: 'number', nullable: false })
    totalPrice: number

    @Column({ type: 'string', nullable: false, default: 'paid' })
    status: 'pending_payment' | 'paid' | 'cancelled' | 'completed'

    @Column({ type: 'string', nullable: false, default: 'pse' })
    paymentMethod: 'pse'

    @Column({ type: 'string' })
    paymentReference: string

    @Column({ type: 'text' })
    notes: string

    isActive: boolean
    isDeleted: boolean
    createdAt: Date
    createdBy: string
    updatedAt: Date
    updatedBy: string
    deletedAt: Date
    deletedBy: string
}

export default Reservation