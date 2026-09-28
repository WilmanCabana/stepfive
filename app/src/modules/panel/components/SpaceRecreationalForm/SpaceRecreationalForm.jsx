/* eslint-disable react/prop-types */
import './SpaceRecreationalForm.css'
import Button from '../../../../core/components/Button/Button'
import Input from '../../../../core/components/Input/Input'
import InputGroup from '../../../../core/components/InputGroup/InputGroup'
import Select from '../../../../core/components/Select/Select'
import Textarea from '../../../../core/components/Textarea/Textarea'
import { useForm } from '../../../../core/hooks/useForm'
import SpaceTypeSelector from '../../components/SpaceTypeSelector/SpaceTypeSelector'
import { SPACE } from '../../constants/space.constant.mjs'

const numericFields = [
    'maxCapacity', 'totalArea', 'bathrooms', 'parkingCapacity', 'pricePerHour', 'depositAmount',
    'seatedCapacity', 'standingCapacity', 'reservationUnitMinutes'
]
const formFields = Object.keys(SPACE.FORM.INITIAL)

const parseStoredValue = (value, fallback) => {
    if (value === undefined || value === null || value === '') return fallback
    if (typeof value !== 'string') return value
    try { return JSON.parse(value) } catch { return value }
}

const listValue = (value, fallback = []) => {
    const parsed = parseStoredValue(value, fallback)
    if (Array.isArray(parsed)) return parsed
    if (typeof parsed === 'string') return parsed.split(',').map(item => item.trim()).filter(Boolean)
    return fallback
}

const openingHoursValue = (value) => {
    const parsed = parseStoredValue(value, {})
    return Object.fromEntries(SPACE.OPTIONS.WEEK_DAYS.map(({ value: day }) => {
        const hours = parsed?.[day]
        if (hours && typeof hours === 'object') {
            const open = hours.open || ''
            const close = hours.close || ''
            return [day, { available: hours.available ?? !!(open && close), open, close }]
        }
        const [open = '', close = ''] = typeof hours === 'string' ? hours.split('-', 2) : []
        return [day, { available: !!(open && close), open, close }]
    }))
}

const reservationFor = (type) => SPACE.OPTIONS.RESERVATION[type] || SPACE.OPTIONS.RESERVATION.synthetic_field

const SpaceRecreationalForm = ({ space, onCancel = () => { }, onSubmit = () => { } }) => {
    const spaceData = Object.fromEntries(Object.entries(space || {}).filter(([field]) => formFields.includes(field)))
    const type = spaceData.type || SPACE.FORM.INITIAL.type
    const initial = {
        ...SPACE.FORM.INITIAL,
        ...spaceData,
        paymentMethods: listValue(spaceData.paymentMethods, SPACE.FORM.INITIAL.paymentMethods)
            .filter(method => SPACE.OPTIONS.PAYMENT_METHODS.some(option => option.value === method)),
        gallery: listValue(spaceData.gallery),
        openingHours: openingHoursValue(spaceData.openingHours),
        reservationMode: reservationFor(type).mode,
        reservationUnitMinutes: spaceData.reservationUnitMinutes || reservationFor(type).unitMinutes
    }
    const { form, handleChange, setForm } = useForm(initial)

    const updateType = (event) => {
        const type = event.target.value
        const reservation = reservationFor(type)
        setForm(current => ({
            ...current,
            type,
            reservationMode: reservation.mode,
            reservationUnitMinutes: reservation.unitMinutes
        }))
    }

    const toggle = (name) => (event) => {
        const checked = event.target.checked
        setForm(current => ({
            ...current,
            [name]: checked,
            ...(!checked && name === 'hasParking' ? { parkingCapacity: '' } : {}),
            ...(!checked && name === 'requiresDeposit' ? { depositAmount: '' } : {})
        }))
    }

    const updateOpeningHour = (day, field) => (event) => {
        const value = event.target.value
        setForm(current => ({
            ...current,
            openingHours: {
                ...current.openingHours,
                [day]: { ...current.openingHours[day], [field]: value }
            }
        }))
    }

    const toggleOpeningDay = (day) => (event) => {
        const available = event.target.checked
        setForm(current => ({
            ...current,
            openingHours: {
                ...current.openingHours,
                [day]: { ...current.openingHours[day], available }
            }
        }))
    }

    const togglePaymentMethod = (method) => (event) => {
        setForm(current => ({
            ...current,
            paymentMethods: event.target.checked
                ? [...current.paymentMethods, method]
                : current.paymentMethods.filter(value => value !== method)
        }))
    }

    const submit = async () => {
        const data = { ...form }
        for (const field of numericFields) data[field] = data[field] === '' ? undefined : Number(data[field])
        data.paymentMethods = form.paymentMethods
        data.gallery = typeof form.gallery === 'string'
            ? form.gallery.split(/[\n,]/).map(item => item.trim()).filter(Boolean)
            : form.gallery
        data.openingHours = Object.fromEntries(SPACE.OPTIONS.WEEK_DAYS.map(({ value: day }) => {
            const { available, open, close } = form.openingHours[day] || {}
            return [day, available && open && close ? `${open}-${close}` : '']
        }))
        const reservation = reservationFor(form.type)
        data.reservationMode = reservation.mode
        data.reservationUnitMinutes = form.type === 'synthetic_field'
            ? 60
            : Number(form.reservationUnitMinutes) || reservation.unitMinutes
        if (!form.hasParking) data.parkingCapacity = 0
        if (!form.requiresDeposit) data.depositAmount = 0
        await onSubmit(data)
    }

    const checkbox = (name, label, onChange = handleChange) => (
        <label className='lx-f-space-recreational-checkbox'>
            <input type='checkbox' name={name} checked={!!form[name]} onChange={onChange} />
            {label}
        </label>
    )

    return <div className='lx-f-space-recreational'>
        <div className='lx-f-space-recreational-section'>
            <div className='lx-f-space-recreational-section-header'><strong>1. General</strong></div>
            <InputGroup columns={2}>
                <Input id='space-name' name='name' label='Nombre' value={form.name} onChange={handleChange} required />
                <SpaceTypeSelector value={form.type} onChange={updateType} />
            </InputGroup>
            <InputGroup columns={2}>
                <Select id='space-condition' name='condition' label='Condición' value={form.condition} onChange={handleChange} options={SPACE.OPTIONS.CONDITIONS} />
                <Input id='space-phone' name='phone' label='Teléfono' value={form.phone} onChange={handleChange} required />
            </InputGroup>
            <Textarea id='space-description' name='description' label='Descripción' value={form.description} onChange={handleChange} />
            {form.type === 'synthetic_field'
                ? <>
                    <InputGroup columns={2}>
                        <Select id='space-field-type' name='fieldType' label='Tipo de cancha' value={form.fieldType} onChange={handleChange} options={SPACE.OPTIONS.FIELD_TYPES} />
                        <Input id='space-field-dimensions' name='fieldDimensions' label='Dimensiones' value={form.fieldDimensions} onChange={handleChange} />
                    </InputGroup>
                    <div className='lx-f-space-recreational-checks'>{checkbox('hasNets', 'Mallas')}{checkbox('hasBalls', 'Balones')}{checkbox('hasVests', 'Petos')}</div>
                </>
                : <>
                    <InputGroup columns={2}>
                        <Input id='space-seated-capacity' name='seatedCapacity' type='number' min='0' label='Capacidad sentada' value={form.seatedCapacity} onChange={handleChange} />
                        <Input id='space-standing-capacity' name='standingCapacity' type='number' min='0' label='Capacidad de pie' value={form.standingCapacity} onChange={handleChange} />
                    </InputGroup>
                    <div className='lx-f-space-recreational-checks'>{checkbox('hasDanceFloor', 'Pista de baile')}{checkbox('hasFurniture', 'Mobiliario')}{checkbox('hasVIPArea', 'Área VIP')}</div>
                </>}
        </div>

        <div className='lx-f-space-recreational-section'>
            <div className='lx-f-space-recreational-section-header'><strong>2. Ubicación</strong></div>
            <InputGroup columns={2}>
                <Input id='space-address' name='address' label='Dirección' value={form.address} onChange={handleChange} required />
                <Input id='space-reference-point' name='referencePoint' label='Punto de referencia' value={form.referencePoint} onChange={handleChange} />
                <Input id='space-neighborhood' name='neighborhood' label='Barrio' value={form.neighborhood} onChange={handleChange} />
                <Input id='space-commune' name='commune' label='Comuna' value={form.commune} onChange={handleChange} />
                <Input id='space-coordinates' name='coordinates' label='Coordenadas (latitud, longitud)' value={form.coordinates} onChange={handleChange} />
                <Input id='space-whatsapp' name='whatsapp' label='WhatsApp' value={form.whatsapp} onChange={handleChange} />
                <Input id='space-email' name='email' type='email' label='Correo electrónico' value={form.email} onChange={handleChange} />
                <Input id='space-instagram' name='instagram' label='Instagram URL' value={form.instagram} onChange={handleChange} />
                <Input id='space-facebook' name='facebook' label='Facebook URL' value={form.facebook} onChange={handleChange} />
            </InputGroup>
        </div>

        <div className='lx-f-space-recreational-section'>
            <div className='lx-f-space-recreational-section-header'><strong>3. Capacidad</strong></div>
            <InputGroup columns={2}>
                <Input id='space-max-capacity' name='maxCapacity' type='number' min='0' label='Capacidad máxima' value={form.maxCapacity} onChange={handleChange} />
                <Input id='space-total-area' name='totalArea' type='number' min='0' label='Área total (m²)' value={form.totalArea} onChange={handleChange} />
                <Input id='space-bathrooms' name='bathrooms' type='number' min='0' label='Baños' value={form.bathrooms} onChange={handleChange} />
                <Input id='space-parking-capacity' name='parkingCapacity' type='number' min='0' label='Cupos de parqueadero' value={form.parkingCapacity} onChange={handleChange} disabled={!form.hasParking} />
            </InputGroup>
            <div className='lx-f-space-recreational-checks'>
                {checkbox('hasParking', 'Parqueadero', toggle('hasParking'))}
                {checkbox('hasKitchen', 'Cocina')}
                {checkbox('hasDressingRooms', 'Camerinos')}
                {checkbox('hasShowers', 'Duchas')}
                {checkbox('hasLighting', 'Iluminación')}
                {checkbox('hasSound', 'Sonido')}
                {checkbox('hasStage', 'Tarima')}
                {checkbox('hasWifi', 'WiFi')}
                {checkbox('hasGenerator', 'Planta eléctrica')}
                {checkbox('isAccessible', 'Accesible')}
            </div>
        </div>

        <div className='lx-f-space-recreational-section'>
            <div className='lx-f-space-recreational-section-header'><strong>4. Precios, reservas y horarios</strong></div>
            <Input id='space-price-hour' name='pricePerHour' type='number' min='0' label={form.type === 'synthetic_field' ? 'Precio por hora' : 'Precio por bloque'} value={form.pricePerHour} onChange={handleChange} required />
            <div className='lx-f-space-recreational-checks'>
                {checkbox('requiresDeposit', 'Requiere depósito', toggle('requiresDeposit'))}
            </div>
            <Input id='space-deposit-amount' name='depositAmount' type='number' min='0' label='Valor del depósito' value={form.depositAmount} onChange={handleChange} disabled={!form.requiresDeposit} />
            <fieldset className='lx-f-space-recreational-payment-methods'>
                <legend>Métodos de pago</legend>
                <div className='lx-f-space-recreational-checks'>
                    {SPACE.OPTIONS.PAYMENT_METHODS.map(method => (
                        <label className='lx-f-space-recreational-checkbox' key={method.value}>
                            <input type='checkbox' checked={form.paymentMethods.includes(method.value)} onChange={togglePaymentMethod(method.value)} />
                            {method.key}
                        </label>
                    ))}
                </div>
            </fieldset>
            <fieldset className='lx-f-space-recreational-reservations'>
                <legend>Reservas</legend>
                {form.type === 'synthetic_field'
                    ? <p>Se reserva por hora (mínimo 1 hora)</p>
                    : <Input id='space-reservation-unit-hours' type='number' min='1' label='Duración del bloque (horas)' value={form.reservationUnitMinutes / 60} onChange={event => setForm(current => ({ ...current, reservationUnitMinutes: Number(event.target.value) * 60 }))} />}
            </fieldset>
            <fieldset className='lx-f-space-recreational-hours'>
                <legend>Horarios de atención<span className='required-asterisk lx-text-color-accent' aria-hidden='true'> *</span></legend>
                {SPACE.OPTIONS.WEEK_DAYS.map(day => {
                    const hours = form.openingHours[day.value] || {}
                    return <div className='lx-f-space-recreational-hours-row' key={day.value}>
                        <strong>{day.key}</strong>
                        <label className='lx-f-space-recreational-checkbox'>
                            <input type='checkbox' checked={!!hours.available} onChange={toggleOpeningDay(day.value)} />
                            Disponible
                        </label>
                        <Input id={`space-${day.value}-open`} name={`${day.value}-open`} type='time' label='Apertura' value={hours.open || ''} onChange={updateOpeningHour(day.value, 'open')} disabled={!hours.available} />
                        <Input id={`space-${day.value}-close`} name={`${day.value}-close`} type='time' label='Cierre' value={hours.close || ''} onChange={updateOpeningHour(day.value, 'close')} disabled={!hours.available} />
                    </div>
                })}
            </fieldset>
            <div className='lx-f-space-recreational-checks'>
                {checkbox('allowsAlcohol', 'Permite alcohol')}
                {checkbox('allowsFood', 'Permite alimentos')}
                {checkbox('allowsMusic', 'Permite música')}
            </div>
        </div>

        <div className='lx-f-space-recreational-section'>
            <div className='lx-f-space-recreational-section-header'><strong>5. Multimedia</strong></div>
            <Input id='space-cover-image' name='coverImage' label='URL de imagen principal' value={form.coverImage} onChange={handleChange} />
            <Input id='space-gallery' name='gallery' label='Galería (URLs separadas por coma)' value={Array.isArray(form.gallery) ? form.gallery.join(', ') : form.gallery} onChange={handleChange} />
        </div>

        <div className='lx-f-space-recreational-actions'>
            <Button variant='bordered' color='auto' width='full' onClick={onCancel}>Cancelar</Button>
            <Button width='full' onClick={submit}>{space ? 'Guardar cambios' : 'Registrar espacio'}</Button>
        </div>
    </div>
}

export default SpaceRecreationalForm