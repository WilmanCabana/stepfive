import { Repository } from '../../core/decorators/decorators.js'
import BaseRepository from '../../core/orm/repository/Base.repository.js'
import SpaceRecreational from '../entities/SpaceRecreational.entity.js'

@Repository()
export class SpaceRecreationalRepository extends BaseRepository<SpaceRecreational> {

    constructor() {
        super(SpaceRecreational)
    }

}

export default SpaceRecreationalRepository
