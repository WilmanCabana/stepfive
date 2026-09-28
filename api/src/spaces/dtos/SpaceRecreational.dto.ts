import DTO from '../../core/orm/dto/Base.dto.js'
import SpaceRecreational from '../entities/SpaceRecreational.entity.js'

export class SpaceRecreationalDTO extends DTO<SpaceRecreational> {
    constructor(entity: Partial<SpaceRecreational>) {
        super(entity)
    }
}

export default SpaceRecreationalDTO
