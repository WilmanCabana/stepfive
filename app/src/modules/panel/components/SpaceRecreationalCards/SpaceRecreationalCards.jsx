import './SpaceRecreationalCards.css'
import SpaceCard from '../SpaceCard/SpaceCard'
import Empity from '../../../../core/components/Empity/Empity'

const SpaceRecreationalCards = ({ spaces = [], onDelete = () => { }, onEdit = () => { }, onView = () => { } }) => (
    <div className='lx-c-space-recreationals'>
        {spaces.length > 0
            ? <div className='lx-c-space-recreationals-content'>
                {spaces.map(space => <SpaceCard key={space.id} space={space} onDelete={onDelete} onEdit={onEdit} onView={onView} />)}
            </div>
            : <Empity icon='stadium' message='No hay espacios recreativos registrados' />
        }
    </div>
)

export default SpaceRecreationalCards