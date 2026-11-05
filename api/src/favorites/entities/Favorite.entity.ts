import User from '../../auth/entities/User.entity.js'
import { Entity, Id, ManyToOne } from '../../core/orm/decorators/decorators.js'
import SpaceRecreational from '../../spaces/entities/SpaceRecreational.entity.js'

// Un favorito solo une un usuario con un espacio recreativo.
// No define columna "status" propia: las columnas de auditoría las agrega el ORM.
@Entity('Favorites')
export class Favorite {

    @Id()
    id: string

    @ManyToOne(() => User, {
        joinColumn: 'userId',
        owner: true
    })
    user: User

    userId: string

    @ManyToOne(() => SpaceRecreational, {
        joinColumn: 'spaceId',
        owner: true,
        eager: true
    })
    space: SpaceRecreational

    spaceId: string

    isActive: boolean
    isDeleted: boolean
    createdAt: Date
    createdBy: string
    updatedAt: Date
    updatedBy: string
    deletedAt: Date
    deletedBy: string
}

export default Favorite
