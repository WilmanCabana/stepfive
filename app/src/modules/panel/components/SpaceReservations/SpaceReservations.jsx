import './SpaceReservations.css'
import { useEffect, useState } from 'react'
import ReservationCalendar from '../ReservationCalendar/ReservationCalendar'
import ReservationRequester from '../../services/ReservationRequester.mjs'
import Select from '../../../../core/components/Select/Select'

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

const RESERVATION_STATUS = {
    pending_payment: 'Pendiente de pago',
    paid: 'Pagada',
    cancelled: 'Cancelada',
    completed: 'Completada'
}

const SpaceReservations = () => {
    const [spaces, setSpaces] = useState([])
    const [selectedSpaceId, setSelectedSpaceId] = useState('')
    const [reservations, setReservations] = useState([])
    const [date, setDate] = useState(localDateKey(new Date()))
    const [loadingSpaces, setLoadingSpaces] = useState(true)
    const [loadingReservations, setLoadingReservations] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        let active = true
        ReservationRequester.getMySpaces()
            .then(result => {
                if (!active) return
                setSpaces(result || [])
                setSelectedSpaceId(result?.[0]?.id || '')
            })
            .catch(error => { if (active) setMessage(error.message || 'No fue posible cargar tus espacios') })
            .finally(() => { if (active) setLoadingSpaces(false) })
        return () => { active = false }
    }, [])

    useEffect(() => {
        if (!selectedSpaceId) {
            setReservations([])
            return undefined
        }
        let active = true
        setLoadingReservations(true)
        ReservationRequester.getSpaceReservations(selectedSpaceId)
            .then(result => { if (active) setReservations(result || []) })
            .catch(error => { if (active) setMessage(error.message || 'No fue posible cargar las reservas del espacio') })
            .finally(() => { if (active) setLoadingReservations(false) })
        return () => { active = false }
    }, [selectedSpaceId])

    const selectedSpace = spaces.find(space => space.id === selectedSpaceId)
    const dayReservations = reservations.filter(reservation => localDateKey(new Date(reservation.startAt)) === date)

    return <section className='lx-c-space-reservations'>
        <header className='lx-c-space-reservations-header'>
            <h2>Reservas recibidas</h2>
            {spaces.length > 1 && <Select
                id='owner-space-select'
                name='spaceId'
                label='Espacio'
                value={selectedSpaceId}
                onChange={event => setSelectedSpaceId(event.target.value)}
                options={spaces.map(space => ({ key: space.name, value: space.id }))}
            />}
        </header>
        {message && <p className='lx-c-space-reservations-message' role='alert'>{message}</p>}
        {loadingSpaces
            ? <p>Cargando espacios...</p>
            : spaces.length === 0
                ? <p className='lx-c-space-reservations-empty'>No tienes espacios registrados.</p>
                : <>
                    {selectedSpace && <div className='lx-c-space-reservations-space'>
                        <strong>{selectedSpace.name}</strong>
                        <span>{selectedSpace.address}</span>
                    </div>}
                    <div className='lx-c-space-reservations-layout'>
                        <ReservationCalendar value={date} onChange={setDate} reservations={reservations} readOnly />
                        <section className='lx-c-space-reservations-day'>
                            <h3>Reservas del {new Date(`${date}T12:00:00`).toLocaleDateString('es-CO', { dateStyle: 'long' })}</h3>
                            {loadingReservations
                                ? <p>Cargando reservas...</p>
                                : dayReservations.length === 0
                                    ? <p>No hay reservas para este día.</p>
                                    : dayReservations.map(reservation => <article key={reservation.id}>
                                        <div>
                                            <strong>{formatTime(reservation.startAt)} - {formatTime(reservation.endAt)}</strong>
                                            <span>{reservation.user?.name || 'Cliente'}</span>
                                            {reservation.user?.phoneNumber && <a href={`tel:${reservation.user.phoneNumber}`}>{reservation.user.phoneNumber}</a>}
                                        </div>
                                        <div className='--reservation-state'>
                                            <span>{RESERVATION_STATUS[reservation.status] || reservation.status}</span>
                                            <strong>${Number(reservation.totalPrice).toLocaleString('es-CO')}</strong>
                                        </div>
                                    </article>)}
                        </section>
                    </div>
                </>}
    </section>
}

export default SpaceReservations