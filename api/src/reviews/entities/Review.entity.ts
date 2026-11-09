import User from '../../auth/entities/User.entity.js'
import { Column, Entity, Id, ManyToOne } from '../../core/orm/decorators/decorators.js'
import SpaceRecreational from '../../spaces/entities/SpaceRecreational.entity.js'

// Una reseña por usuario y espacio: calificación de 1 a 5 y comentario opcional.
// No define columna "status" propia: las columnas de auditoría las agrega el ORM.
@Entity('Reviews')
export class Review {

    @Id()
    id: string

    @ManyToOne(() => SpaceRecreational, {
        joinColumn: 'spaceId',
        owner: true
    })
    space: SpaceRecreational

    spaceId: string

    @ManyToOne(() => User, {
        joinColumn: 'userId',
        owner: true
    })
    user: User

    userId: string

    @Column({ type: 'number', nullable: false })
    rating: number

    @Column({ type: 'text' })
    comment: string

    isActive: boolean
    isDeleted: boolean
    createdAt: Date
    createdBy: string
    updatedAt: Date
    updatedBy: string
    deletedAt: Date
    deletedBy: string
}

export default Review
