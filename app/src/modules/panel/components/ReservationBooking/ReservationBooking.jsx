import './ReservationBooking.css'
import { useEffect, useState } from 'react'
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
        setSelectedSlots([])
        setMessage('')
        ReservationRequester.getAvailability(space.id, date)
            .then(result => { if (active) setSlots(result || []) })
            .catch(error => { if (active) setMessage(error.message || 'No fue posible consultar la disponibilidad') })
            .finally(() => { if (active) setLoadingSlots(false) })
        return () => { active = false }
    }, [space.id, date])

    const toggleSlot = (slot) => {
        setSelectedSlots(current => {
            const existingIndex = current.findIndex(item => item.startAt === slot.startAt)
            if (existingIndex >= 0) {
                if (current.length === 1) return []
                if (existingIndex === 0) return current.slice(1)
                if (existingIndex === current.length - 1) return current.slice(0, -1)
                return current
            }
            const ordered = [...current, slot].sort((left, right) => new Date(left.startAt) - new Date(right.startAt))
            const contiguous = ordered.every((item, index) => index === 0 || ordered[index - 1].endAt === item.startAt)
            return contiguous ? ordered : [slot]
        })
    }

    const total = selectedSlots.reduce((sum, slot) => sum + Number(slot.totalPrice), 0)

    const submit = async () => {
        if (!selectedSlots.length) return
        setSubmitting(true)
        setMessage('')
        try {
            const ordered = [...selectedSlots].sort((left, right) => new Date(left.startAt) - new Date(right.startAt))
            const result = await ReservationRequester.createReservation({
                spaceId: space.id,
                startAt: ordered[0].startAt,
                endAt: ordered[ordered.length - 1].endAt,
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
                            onClick={() => toggleSlot(slot)}
                        >{slot.label}</button>
                    })}
                </div>
            </section>
        </div>
        <Textarea id='reservation-notes' label='Notas (opcional)' value={notes} onChange={event => setNotes(event.target.value)} />
        {selectedSlots.length > 0 && <div className='lx-p-reservation-booking-total'>
            <span>{selectedSlots.length} {selectedSlots.length === 1 ? 'franja' : 'franjas'}</span>
            <strong>${total.toLocaleString('es-CO')}</strong>
        </div>}
        {message && <p className='lx-p-reservation-booking-message' role='alert'>{message}</p>}
        <div className='lx-p-reservation-booking-actions'>
            <Button color='auto' variant='bordered' onClick={onCancel}>Cancelar</Button>
            <Button disabled={!selectedSlots.length || submitting} loading={submitting} onClick={submit}>Pagar y confirmar</Button>
        </div>
    </div>
}

export default ReservationBooking