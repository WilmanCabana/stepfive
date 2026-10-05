import './MyReservations.css'
import { useEffect, useState } from 'react'
import ButtonGroup from '../../../../core/components/ButtonGroup/ButtonGroup'
import Icon from '../../../../core/components/Icon/Icon'
import Modal from '../../../../core/components/Modal/Modal'
import SpaceRecreationalDetail from '../../components/SpaceRecreationalDetail/SpaceRecreationalDetail'
import ReservationRequester from '../../services/ReservationRequester.mjs'

const STATUS_LABELS = {
    pending_payment: 'Pendiente de pago',
    paid: 'Pagada',
    cancelled: 'Cancelada',
    completed: 'Completada'
}

const localDateKey = (date) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date)
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
    return `${values.year}-${values.month}-${values.day}`
}

const formatTime = (value) => new Date(value).toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit'
})

const formatDate = (dateKey) => new Date(`${dateKey}T12:00:00-05:00`).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota', dateStyle: 'long'
})

const MyReservations = () => {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [range, setRange] = useState('upcoming')
    const [selectedReservation, setSelectedReservation] = useState(null)

    useEffect(() => {
        let active = true
        ReservationRequester.getMyReservations()
            .then(result => { if (active) setReservations(result || []) })
            .catch(error => { if (active) setMessage(error.message || 'No fue posible cargar tus reservas') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    const todayKey = localDateKey(new Date())
    const sortedReservations = reservations
        .filter(reservation => range === 'upcoming'
            ? localDateKey(new Date(reservation.startAt)) >= todayKey
            : localDateKey(new Date(reservation.startAt)) < todayKey)
        .sort((left, right) => new Date(left.startAt) - new Date(right.startAt))
    if (range === 'past') sortedReservations.reverse()
    const groupedReservations = sortedReservations.reduce((groups, reservation) => {
        const dateKey = localDateKey(new Date(reservation.startAt))
        groups[dateKey] ||= []
        groups[dateKey].push(reservation)
        return groups
    }, {})

    return <main className='lx-p-my-reservations'>
        <header className='lx-p-my-reservations-header'>
            <div><p>Cuenta</p><h1>Mis reservas</h1></div>
            <span>{reservations.length} reservas</span>
        </header>
        {message && <p className='lx-p-my-reservations-message' role='alert'>{message}</p>}
        {loading
            ? <p>Cargando reservas...</p>
            : reservations.length === 0
                ? <p className='lx-p-my-reservations-empty'>Todavía no tienes reservas.</p>
                : <div className='lx-p-my-reservations-timeline'>
                    <div className='lx-p-my-reservations-controls'>
                        <ButtonGroup buttons={['Próximas', 'Pasadas']} options={['upcoming', 'past']} onClick={setRange} />
                    </div>
                    {Object.entries(groupedReservations).length === 0
                        ? <p className='lx-p-my-reservations-empty'>No hay reservas {range === 'upcoming' ? 'próximas' : 'pasadas'}.</p>
                        : Object.entries(groupedReservations).map(([dateKey, items]) => <section className='lx-p-my-reservations-date-group' key={dateKey}>
                            <header className='lx-p-my-reservations-date-header'>
                                <span className='lx-p-my-reservations-date-point' />
                                <h2>{formatDate(dateKey)}</h2>
                            </header>
                            {items.map(reservation => <button
                                className='lx-p-my-reservations-item'
                                key={reservation.id}
                                type='button'
                                onClick={() => reservation.space && setSelectedReservation(reservation)}
                            >
                                <span className='lx-p-my-reservations-space-image'>
                                    {reservation.space?.coverImage
                                        ? <img src={reservation.space.coverImage} alt='' />
                                        : <Icon name={reservation.space?.type === 'event_hall' ? 'event' : 'sports_soccer'} />}
                                </span>
                                <span className='lx-p-my-reservations-info'>
                                    <strong>{reservation.space?.name || 'Espacio recreativo'}</strong>
                                    <span>{formatDate(dateKey)}</span>
                                    <span>{formatTime(reservation.startAt)} - {formatTime(reservation.endAt)}</span>
                                </span>
                                <span className='lx-p-my-reservations-state'>
                                    <span className={`--status --${reservation.status}`}>{STATUS_LABELS[reservation.status] || reservation.status}</span>
                                    <strong>${Number(reservation.totalPrice).toLocaleString('es-CO')}</strong>
                                </span>
                            </button>)}
                        </section>)}
                </div>}
        <Modal show={!!selectedReservation} title='Detalle del espacio y reserva' size='large' position='right' onClose={() => setSelectedReservation(null)}>
            <SpaceRecreationalDetail space={selectedReservation?.space} reservation={selectedReservation} onClose={() => setSelectedReservation(null)} />
        </Modal>
    </main>
}

export default MyReservations