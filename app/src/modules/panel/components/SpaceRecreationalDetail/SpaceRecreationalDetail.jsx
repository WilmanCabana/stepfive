/* eslint-disable react/prop-types */
import './SpaceRecreationalDetail.css'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import SpaceConditionTag from '../../components/SpaceConditionTag/SpaceConditionTag'
import SpaceVerifyButton from '../../components/SpaceVerifyButton/SpaceVerifyButton'
import SpaceVerificationTag from '../../components/SpaceVerificationTag/SpaceVerificationTag'
import { SPACE } from '../../constants/space.constant.mjs'

const parseStoredValue = (value) => {
    if (typeof value !== 'string') return value
    try { return JSON.parse(value) } catch { return value }
}

const isPresent = value => value !== null && value !== undefined && value !== ''

const DetailField = ({ label, value, href, external = false }) => {
    if (!isPresent(value)) return null
    return <div className='lx-c-space-recreational-detail-field'>
        <span className='--label'>{label}</span>
        <span className='--value'>
            {href
                ? <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{value}</a>
                : value}
        </span>
    </div>
}

const DetailSection = ({ icon, title, children, className = '' }) => (
    <section className={`lx-c-space-recreational-detail-section ${className}`}>
        <h3 className='lx-c-space-recreational-detail-section-title'><Icon name={icon} />{title}</h3>
        {children}
    </section>
)

const FeatureList = ({ items, showUnavailable = false }) => {
    const visibleItems = items.filter(([, enabled]) => enabled === true || (showUnavailable && typeof enabled === 'boolean'))
    if (!visibleItems.length) return null
    return <div className='lx-c-space-recreational-detail-features'>
        {visibleItems.map(([label, enabled]) => <span className={`lx-c-space-recreational-detail-feature${enabled ? '' : ' --unavailable'}`} key={label}>
            <Icon name={enabled ? 'check_circle' : 'cancel'} />{showUnavailable ? `${label}: ${enabled ? 'Sí' : 'No'}` : label}
        </span>)}
    </div>
}

const timeParts = (hours) => {
    if (typeof hours === 'string') {
        const [open = '', close = ''] = hours.split('-', 2)
        return open && close ? [open, close] : ['--', '--']
    }
    if (hours && typeof hours === 'object') {
        const open = hours.open || ''
        const close = hours.close || ''
        return hours.available === false || !open || !close ? ['--', '--'] : [open, close]
    }
    return ['--', '--']
}

const socialUrl = (network, value) => {
    if (!isPresent(value)) return undefined
    const normalized = String(value).trim()
    if (/^https?:\/\//i.test(normalized)) return normalized
    const username = normalized.replace(/^@/, '').replace(/^\/+|\/+$/g, '')
    return `https://${network}.com/${username}`
}

const conditionLabels = {
    new: 'Nuevo',
    good: 'Bueno',
    regular: 'Regular',
    needs_maintenance: 'Mantenimiento'
}

const SpaceRecreationalDetail = ({ space, reservation, onEdit, onDelete, onVerified, onClose, onReserve, canVerify = false }) => {
    if (!space) return null
    const hours = parseStoredValue(space.openingHours) || {}
    const paymentMethods = parseStoredValue(space.paymentMethods)
    const gallery = parseStoredValue(space.gallery) || []
    const galleryImages = Array.isArray(gallery) ? gallery.filter(isPresent) : []
    const typeLabel = space.type === 'event_hall' ? 'Salón de eventos' : 'Cancha sintética'
    const coordinates = typeof space.coordinates === 'string'
        ? space.coordinates.trim().split(/\s*,\s*/)
        : []
    const mapsUrl = coordinates.length === 2 && coordinates.every(Boolean)
        ? `https://www.google.com/maps?q=${encodeURIComponent(`${coordinates[0]},${coordinates[1]}`)}`
        : undefined
    const phoneHref = isPresent(space.phone) ? `tel:${String(space.phone).replace(/[^+\d]/g, '')}` : undefined
    const whatsappNumber = isPresent(space.whatsapp) ? String(space.whatsapp).replace(/\D/g, '') : ''
    const instagramUrl = socialUrl('instagram', space.instagram)
    const facebookUrl = socialUrl('facebook', space.facebook)
    const fieldType = SPACE.OPTIONS.FIELD_TYPES.find(option => option.value === space.fieldType)?.key || space.fieldType
    const paymentLabels = paymentMethods === 'pse' || (Array.isArray(paymentMethods) && paymentMethods.includes('pse'))
        ? ['PSE']
        : Array.isArray(paymentMethods) ? paymentMethods : []
    const createdAt = isPresent(space.createdAt) ? new Date(space.createdAt).toLocaleString('es-CO') : null
    const updatedAt = isPresent(space.updatedAt) ? new Date(space.updatedAt).toLocaleString('es-CO') : null
    const priceLabel = space.type === 'event_hall' ? 'Precio por bloque' : 'Precio por hora'
    const reservationLabel = space.reservationMode === 'block'
        ? `Bloques de ${Number(space.reservationUnitMinutes) / 60} horas`
        : 'Por hora'
    const reservationDuration = reservation
        ? Math.max(0, Math.round((new Date(reservation.endAt).getTime() - new Date(reservation.startAt).getTime()) / 60_000))
        : 0
    const durationLabel = reservationDuration >= 60
        ? `${Math.floor(reservationDuration / 60)} h${reservationDuration % 60 ? ` ${reservationDuration % 60} min` : ''}`
        : `${reservationDuration} min`

    return <div className='lx-c-space-recreational-detail'>
        <div className='lx-c-space-recreational-detail-header'>
            <div>
                <h2>{space.name}</h2>
                <div className='lx-c-space-recreational-detail-header-tags'>
                    <span>{typeLabel}</span>
                    {isPresent(space.condition) && <SpaceConditionTag condition={space.condition} />}
                    {isPresent(space.verificationStatus) && <SpaceVerificationTag status={space.verificationStatus} />}
                </div>
            </div>
            <div className='lx-c-space-recreational-detail-header-actions'>
                {onReserve && <Button onClick={onReserve}><Icon name='event_available' />Reservar</Button>}
                <Button icon variant='plain' onClick={onClose} aria-label='Cerrar detalle'><Icon name='close' /></Button>
            </div>
        </div>
        <div className='lx-c-space-recreational-detail-sections'>
            {reservation && <DetailSection icon='event_available' title='Datos de la reserva'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label='Inicio' value={new Date(reservation.startAt).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short' })} />
                    <DetailField label='Fin' value={new Date(reservation.endAt).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short' })} />
                    <DetailField label='Duración' value={durationLabel} />
                    <DetailField label='Precio total' value={`$${Number(reservation.totalPrice).toLocaleString('es-CO')}`} />
                    <DetailField label='Estado de la reserva' value={{ pending_payment: 'Pendiente de pago', paid: 'Pagada', cancelled: 'Cancelada', completed: 'Completada' }[reservation.status] || reservation.status} />
                    <DetailField label='Referencia de pago' value={reservation.paymentReference || 'No registrada'} />
                    <DetailField label='Notas' value={reservation.notes || 'Sin notas'} />
                </div>
            </DetailSection>}
            <DetailSection icon='info' title='Información general'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label='Nombre' value={space.name} />
                    <DetailField label='Tipo' value={typeLabel} />
                    <DetailField label='Condición' value={conditionLabels[space.condition] || space.condition} />
                    <DetailField label='Estado de verificación' value={space.verificationStatus} />
                </div>
                <DetailField label='Descripción' value={space.description} />
            </DetailSection>

            <DetailSection icon='location_on' title='Ubicación'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label='Dirección' value={space.address} />
                    <DetailField label='Barrio' value={space.neighborhood} />
                    <DetailField label='Comuna' value={space.commune} />
                    <DetailField label='Punto de referencia' value={space.referencePoint} />
                    <DetailField label='Coordenadas' value={space.coordinates} href={mapsUrl} external />
                </div>
            </DetailSection>

            <DetailSection icon='call' title='Contacto'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label='Teléfono' value={space.phone} href={phoneHref} />
                    <DetailField label='WhatsApp' value={space.whatsapp} href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined} external />
                    <DetailField label='Email' value={space.email} href={isPresent(space.email) ? `mailto:${space.email}` : undefined} />
                    <DetailField label='Instagram' value={space.instagram} href={instagramUrl} external />
                    <DetailField label='Facebook' value={space.facebook} href={facebookUrl} external />
                </div>
            </DetailSection>

            <DetailSection icon='groups' title='Capacidad y características'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label={space.type === 'event_hall' ? 'Capacidad de pie' : 'Capacidad máxima'} value={space.maxCapacity} />
                    <DetailField label='Área total' value={isPresent(space.totalArea) ? `${space.totalArea} m²` : null} />
                    <DetailField label='Baños' value={space.bathrooms} />
                    {typeof space.hasParking === 'boolean' && <DetailField label='Parqueadero' value={space.hasParking
                        ? `Sí${isPresent(space.parkingCapacity) ? ` · ${space.parkingCapacity} cupos` : ''}`
                        : 'No'} />}
                </div>
                <FeatureList showUnavailable items={[
                    ['Cocina', space.hasKitchen], ['Camerinos', space.hasDressingRooms], ['Duchas', space.hasShowers],
                    ['Iluminación', space.hasLighting], ['Sonido', space.hasSound], ['Tarima', space.hasStage],
                    ['WiFi', space.hasWifi], ['Planta eléctrica', space.hasGenerator], ['Accesible', space.isAccessible],
                    ...(space.type === 'synthetic_field' ? [['Mallas', space.hasNets], ['Balones', space.hasBalls], ['Petos', space.hasVests]] : []),
                    ['Permite alcohol', space.allowsAlcohol], ['Permite alimentos', space.allowsFood], ['Permite música', space.allowsMusic]
                ]} />
            </DetailSection>

            <DetailSection icon='payments' title='Servicios y precios'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label={priceLabel} value={isPresent(space.pricePerHour) ? `$${Number(space.pricePerHour).toLocaleString('es-CO')}` : null} />
                    <DetailField label='Modalidad de reserva' value={reservationLabel} />
                    {isPresent(space.minReservationUnits) && <DetailField label='Reserva mínima' value={space.minReservationUnits} />}
                    {isPresent(space.maxReservationUnits) && <DetailField label='Reserva máxima' value={space.maxReservationUnits} />}
                    <DetailField label='Métodos de pago' value={paymentLabels.length > 0 ? paymentLabels.join(', ') : 'No registrados'} />
                </div>
            </DetailSection>

            <DetailSection icon='schedule' title='Horarios'>
                <div className='lx-c-space-recreational-detail-hours-wrap'>
                    <table className='lx-c-space-recreational-detail-hours'>
                        <thead><tr><th>Día</th><th>Apertura</th><th>Cierre</th></tr></thead>
                        <tbody>{SPACE.OPTIONS.WEEK_DAYS.map(day => {
                            const [open, close] = timeParts(hours?.[day.value])
                            return <tr key={day.value}><th scope='row'>{day.key}</th><td>{open}</td><td>{close}</td></tr>
                        })}</tbody>
                    </table>
                </div>
            </DetailSection>

            {(isPresent(space.coverImage) || galleryImages.length > 0) && <DetailSection icon='photo_library' title='Multimedia'>
                {isPresent(space.coverImage) && <div className='lx-c-space-recreational-detail-cover-wrap'>
                    <span className='lx-c-space-recreational-detail-media-label'>Imagen de portada</span>
                    <img className='lx-c-space-recreational-detail-cover' src={space.coverImage} alt={space.name} />
                </div>}
                {galleryImages.length > 0 && <div className='lx-c-space-recreational-detail-gallery'>
                    {galleryImages.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${space.name} · imagen ${index + 1}`} loading='lazy' />)}
                </div>}
            </DetailSection>}

            {space.type === 'synthetic_field' && <DetailSection icon='sports_soccer' title='Específicos de cancha sintética'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label='Tipo de cancha' value={fieldType} />
                    <DetailField label='Dimensiones' value={space.fieldDimensions} />
                </div>
            </DetailSection>}

            {space.type === 'event_hall' && <DetailSection icon='celebration' title='Específicos de salón'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label='Capacidad sentados' value={space.seatedCapacity} />
                </div>
                <FeatureList showUnavailable items={[
                    ['Pista de baile', space.hasDanceFloor], ['Mobiliario', space.hasFurniture], ['Área VIP', space.hasVIPArea]
                ]} />
            </DetailSection>}

            <DetailSection icon='verified' title='Estado' className='--state'>
                <div className='lx-c-space-recreational-detail-grid'>
                    <DetailField label='Verificación' value={isPresent(space.verificationStatus) ? <SpaceVerificationTag status={space.verificationStatus} /> : null} />
                    <DetailField label='Creado el' value={createdAt} />
                    <DetailField label='Última actualización' value={updatedAt} />
                </div>
            </DetailSection>
        </div>
        <div className='lx-c-space-recreational-detail-actions'>
            {canVerify && <SpaceVerifyButton space={space} onVerified={onVerified} />}
            {onEdit && <Button variant='bordered' onClick={() => onEdit(space)}><Icon name='edit' />Editar</Button>}
            {onDelete && <Button color='danger' variant='bordered' onClick={() => onDelete(space)}><Icon name='delete' />Eliminar</Button>}
        </div>
    </div>
}

export default SpaceRecreationalDetail