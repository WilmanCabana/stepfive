/* eslint-disable react/prop-types */
import './SpaceCard.css'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import SpaceConditionTag from '../SpaceConditionTag/SpaceConditionTag'
import SpaceTypeSelector from '../SpaceTypeSelector/SpaceTypeSelector'
import SpaceVerificationTag from '../SpaceVerificationTag/SpaceVerificationTag'

const SpaceCard = ({ space, onView, onReserve, onEdit, onDelete, currentUserId }) => {
    const canReserve = onReserve && space.ownerId !== currentUserId

    return (
    <article className='lx-c-space-card'>
        <div className='lx-c-space-card-head'>
            <div className='lx-c-space-card-cover'>
                {space.coverImage
                    ? <img src={space.coverImage} alt={space.name} />
                    : <Icon name={space.type === 'event_hall' ? 'event' : 'sports_soccer'} size='xxxl' />}
            </div>
        </div>
        <div className='lx-c-space-card-content'>
            <div className='lx-c-space-card-summary'>
                <div className='lx-c-space-card-heading'>
                    <div className='lx-c-space-card-title-group'>
                        <h3 className='lx-c-space-card-name'>{space.name}</h3>
                        <div className='lx-c-space-card-type'><SpaceTypeSelector value={space.type} readOnly /></div>
                    </div>
                    <div className='lx-c-space-card-tags'>
                        <SpaceConditionTag condition={space.condition} />
                        <SpaceVerificationTag status={space.verificationStatus} />
                    </div>
                </div>
                <div className='lx-c-space-card-location'><Icon name='location_on' />{space.address}</div>
                <div className='lx-c-space-card-contact'><Icon name='phone' />{space.phone}</div>
                <div className='lx-c-space-card-price'><Icon name='payments' />${Number(space.pricePerHour || 0).toLocaleString('es-CO')} {space.type === 'event_hall' ? `/ bloque de ${Number(space.reservationUnitMinutes || 240) / 60} h` : '/ hora'}</div>
            </div>
            <div className={`lx-c-space-card-footer${canReserve ? ' --reservable' : ''}`}>
                {canReserve
                    ? <Button size='s' color='auto' width='full' icon title='Ver detalle' ariaLabel='Ver detalle' onClick={() => onView(space)}><Icon name='visibility' /></Button>
                    : <Button size='xs' color='auto' width='full' onClick={() => onView(space)}><Icon name='visibility' />Ver detalle</Button>}
                {canReserve && <Button size='xs' width='full' onClick={() => onReserve(space)}><Icon name='event_available' />Reservar</Button>}
                {onEdit && <Button size='s' color='auto' width='full' variant='bordered' icon onClick={() => onEdit(space)}><Icon name='edit' /></Button>}
                {onDelete && <Button size='s' color='danger' variant='dimed' icon onClick={() => onDelete(space)}><Icon name='delete' /></Button>}
            </div>
        </div>
    </article>
    )
}

export default SpaceCard
