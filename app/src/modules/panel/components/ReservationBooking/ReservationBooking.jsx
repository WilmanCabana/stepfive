import './ReservationBooking.css'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../../../../core/components/Button/Button'
import Textarea from '../../../../core/components/Textarea/Textarea'
import ReservationCalendar from '../ReservationCalendar/ReservationCalendar'
import ReservationRequester from '../../services/ReservationRequester.mjs'

const dateToday = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date())

const ReservationBooking = ({ space, onCreated, onCancel }) => {
    const [date, setDate] = useState(dateToday)
    const [slots, setSlots] = useState([])
    const [selectedSlots, setSelectedSlots] = useState([])
    const [notes, setNotes] = useState('')
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        let active = true
        setLoadingSlots(true)
        setSlots([])
        setMessage('')
        ReservationRequester.getAvailability(space.id, date)
            .then(result => { if (active) setSlots(result || []) })
            .catch(error => { if (active) setMessage(error.message || 'No fue posible consultar la disponibilidad') })
            .finally(() => { if (active) setLoadingSlots(false) })
        return () => { active = false }
    }, [space.id, date])

    useEffect(() => {
        setSelectedSlots([])
    }, [space.id])

    const toggleSlot = (slot) => {
        setSelectedSlots(current => {
            const existingIndex = current.findIndex(item => item.startAt === slot.startAt)
            if (existingIndex >= 0) {
                return current.filter((_, index) => index !== existingIndex)
            }
            return [...current, { ...slot, date }].sort((left, right) => new Date(left.startAt) - new Date(right.startAt))
        })
    }

    const total = selectedSlots.reduce((sum, slot) => sum + Number(slot.totalPrice), 0)

    const submit = async () => {
        if (!selectedSlots.length) return
        setSubmitting(true)
        setMessage('')
        try {
            const dates = [...new Set(selectedSlots.map(slot => slot.date))]
            const availabilityByDate = await Promise.all(dates.map(async selectedDate => [
                selectedDate,
                await ReservationRequester.getAvailability(space.id, selectedDate)
            ]))
            const availableIntervals = new Set(availabilityByDate.flatMap(([, availableSlots]) =>
                availableSlots.map(slot => `${slot.startAt}|${slot.endAt}`)
            ))
            const unavailableIntervals = new Set(selectedSlots
                .filter(slot => !availableIntervals.has(`${slot.startAt}|${slot.endAt}`))
                .map(slot => `${slot.startAt}|${slot.endAt}`))

            if (unavailableIntervals.size > 0) {
                setSelectedSlots(current => current.map(slot => ({
                    ...slot,
                    unavailable: unavailableIntervals.has(`${slot.startAt}|${slot.endAt}`)
                })))
                throw new Error('Una o más franjas ya no están disponibles. Quita las franjas marcadas e inténtalo de nuevo.')
            }

            const result = await ReservationRequester.createReservationsBatch({
                spaceId: space.id,
                reservations: selectedSlots.map(({ startAt, endAt }) => ({ startAt, endAt })),
                notes
            })
            onCreated?.(result)
        } catch (error) {
            setMessage(error.message || 'No fue posible crear la reserva')
        } finally {
            setSubmitting(false)
        }
    }

    return <div className='lx-p-reservation-booking'>
        <div className='lx-p-reservation-booking-summary'>
            <strong>{space.name}</strong>
            <span>{space.reservationMode === 'block' ? `Bloques de ${Number(space.reservationUnitMinutes) / 60} h` : 'Reserva por hora'}</span>
        </div>
        <div className='lx-p-reservation-booking-layout'>
            <ReservationCalendar value={date} onChange={setDate} />
            <section className='lx-p-reservation-booking-times'>
                <h3>Horarios disponibles</h3>
                {loadingSlots && <p>Cargando franjas...</p>}
                {!loadingSlots && slots.length === 0 && <p>No hay franjas disponibles para esta fecha.</p>}
                <div className='lx-p-reservation-booking-slots'>
                    {slots.map(slot => {
                        const selected = selectedSlots.some(item => item.startAt === slot.startAt)
                        return <button
                            type='button'
                            key={slot.startAt}
                            className={selected ? '--selected' : ''}
                            aria-pressed={selected}
                            disabled={loadingSlots || submitting}
                            onClick={() => toggleSlot(slot)}
                        >{slot.label}</button>
                    })}
                </div>
            </section>
        </div>
        {selectedSlots.length > 0 && <section className='lx-p-reservation-booking-cart' aria-label='Franjas seleccionadas'>
            <h3>Tu selección</h3>
            <p>Puedes elegir horarios de diferentes fechas; se conservan al cambiar el calendario.</p>
            <ul>
                {selectedSlots.map(slot => <li key={slot.startAt} className={slot.unavailable ? '--unavailable' : ''}>
                    <span>
                        <strong>{new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium' }).format(new Date(slot.startAt))}</strong>
                        <small>{slot.label}{slot.unavailable ? ' · Ya no disponible' : ''}</small>
                    </span>
                    <span className='lx-p-reservation-booking-cart-price'>${Number(slot.totalPrice).toLocaleString('es-CO')}</span>
                    <button type='button' disabled={submitting} onClick={() => toggleSlot(slot)} aria-label={`Quitar franja del ${slot.label}`}>Quitar</button>
                </li>)}
            </ul>
        </section>}
        <Textarea id='reservation-notes' label='Notas (opcional)' value={notes} onChange={event => setNotes(event.target.value)} />
        {selectedSlots.length > 0 && <div className='lx-p-reservation-booking-total'>
            <span>{selectedSlots.length} {selectedSlots.length === 1 ? 'franja seleccionada' : 'franjas seleccionadas'}</span>
            <strong>${total.toLocaleString('es-CO')}</strong>
        </div>}
        {message && <p className='lx-p-reservation-booking-message' role='alert'>{message}</p>}
        <div className='lx-p-reservation-booking-actions'>
            <Button color='auto' variant='bordered' onClick={onCancel}>Cancelar</Button>
            <Button disabled={!selectedSlots.length || submitting} loading={submitting} onClick={submit}>Pagar y confirmar {selectedSlots.length > 1 ? 'reservas' : 'reserva'}</Button>
        </div>
    </div>
}

ReservationBooking.propTypes = {
    space: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        reservationMode: PropTypes.string,
        reservationUnitMinutes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }).isRequired,
    onCreated: PropTypes.func,
    onCancel: PropTypes.func,
}

export default ReservationBooking