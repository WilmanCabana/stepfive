import './SpaceRecreationalCards.css'
import SpaceCard from '../SpaceCard/SpaceCard'
import Empity from '../../../../core/components/Empity/Empity'

const SpaceRecreationalCards = ({ spaces = [], onDelete = () => { }, onEdit = () => { }, onView = () => { }, onReserve, currentUserId, emptyMessage, emptyIcon, favoriteIds, onToggleFavorite }) => (
    <div className='lx-c-space-recreationals'>
        {spaces.length > 0
            ? <div className='lx-c-space-recreationals-content'>
                {spaces.map(space => <SpaceCard key={space.id} space={space} onDelete={onDelete} onEdit={onEdit} onView={onView} onReserve={onReserve} currentUserId={currentUserId} isFavorite={favoriteIds?.has(space.id)} onToggleFavorite={onToggleFavorite} />)}
            </div>
            : <Empity icon={emptyIcon || 'stadium'} message={emptyMessage || 'No hay espacios recreativos registrados'} />
        }
    </div>
)

export default SpaceRecreationalCards