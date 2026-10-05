import './ReservationCalendar.css'
import { useEffect, useState } from 'react'

const localDateKey = (date) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date)
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
    return `${values.year}-${values.month}-${values.day}`
}

const parseDateKey = (value) => {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day, 12)
}

const ReservationCalendar = ({ value, onChange, reservations = [], readOnly = false }) => {
    const [month, setMonth] = useState(() => parseDateKey(value || localDateKey(new Date())))
    const todayKey = localDateKey(new Date())

    useEffect(() => {
        if (value) setMonth(parseDateKey(value))
    }, [value])

    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    const gridStart = new Date(firstDay)
    gridStart.setDate(firstDay.getDate() - firstDay.getDay())
    const dates = Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart)
        date.setDate(gridStart.getDate() + index)
        return date
    })
    const title = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(month)
    const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

    return <section className='lx-c-reservation-calendar' aria-label='Calendario de reservas'>
        <header className='lx-c-reservation-calendar-header'>
            <button type='button' onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label='Mes anterior'>&lt;</button>
            <h3>{title}</h3>
            <button type='button' onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label='Mes siguiente'>&gt;</button>
        </header>
        <div className='lx-c-reservation-calendar-grid'>
            {weekDays.map(day => <span className='--weekday' key={day}>{day}</span>)}
            {dates.map(date => {
                const dateKey = localDateKey(date)
                const selected = dateKey === value
                const currentMonth = date.getMonth() === month.getMonth()
                const dayReservations = reservations.filter(reservation => localDateKey(new Date(reservation.startAt)) === dateKey)
                const disabled = !readOnly && dateKey < todayKey
                return <button
                    type='button'
                    key={dateKey}
                    className={`${currentMonth ? '' : '--outside'}${selected ? ' --selected' : ''}${dateKey === todayKey ? ' --today' : ''}`}
                    disabled={disabled}
                    onClick={() => onChange?.(dateKey)}
                    aria-pressed={selected}
                    aria-label={`${dateKey}${dayReservations.length ? `, ${dayReservations.length} reservas` : ''}`}
                >
                    <span>{date.getDate()}</span>
                    {dayReservations.length > 0 && <small>{dayReservations.length}</small>}
                </button>
            })}
        </div>
    </section>
}

export default ReservationCalendar