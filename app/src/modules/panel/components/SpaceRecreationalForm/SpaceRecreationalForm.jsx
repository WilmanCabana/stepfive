/* eslint-disable react/prop-types */
import './SpaceRecreationalForm.css'
import { useState } from 'react'
import Button from '../../../../core/components/Button/Button'
import Input from '../../../../core/components/Input/Input'
import InputGroup from '../../../../core/components/InputGroup/InputGroup'
import ImageUploader from '../../../../core/components/ImageUploader/ImageUploader'
import Select from '../../../../core/components/Select/Select'
import Textarea from '../../../../core/components/Textarea/Textarea'
import { useForm } from '../../../../core/hooks/useForm'
import SpaceTypeSelector from '../../components/SpaceTypeSelector/SpaceTypeSelector'
import { SPACE } from '../../constants/space.constant.mjs'

const numericFields = [
    'maxCapacity', 'totalArea', 'bathrooms', 'parkingCapacity', 'pricePerHour',
    'seatedCapacity', 'reservationUnitMinutes'
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
const isFile = (value) => typeof File !== 'undefined' && value instanceof File

const SpaceRecreationalForm = ({ space, onCancel = () => { }, onSubmit = () => { } }) => {
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [validationError, setValidationError] = useState('')
    const spaceData = Object.fromEntries(Object.entries(space || {}).filter(([field]) => formFields.includes(field)))
    const type = spaceData.type || SPACE.FORM.INITIAL.type
    const initial = {
        ...SPACE.FORM.INITIAL,
        ...spaceData,
        paymentMethods: 'pse',
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
            ...(!checked && name === 'hasParking' ? { parkingCapacity: '' } : {})
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

    const submit = async () => {
        const blockHours = Number(form.reservationUnitMinutes) / 60
        if (form.type === 'event_hall' && (!Number.isInteger(blockHours) || blockHours < 3 || blockHours > 8)) {
            setValidationError('La duración del bloque para salones debe estar entre 3 y 8 horas.')
            return
        }
        setValidationError('')
        setUploading(true)
        setUploadError('')
        try {
            const upload = async (file) => {
                const { uploadImage } = await import('../../../../core/utils/uploadImage.mjs')
                return uploadImage(file, `spaces/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
            }
            const coverImage = isFile(form.coverImage) ? await upload(form.coverImage) : form.coverImage
            const gallery = await Promise.all(form.gallery.map(image => isFile(image) ? upload(image) : image))
            if (coverImage === null || gallery.some(image => image === null)) {
                setUploadError('No se pudieron subir todas las imágenes. Inténtalo de nuevo.')
                return
            }

            const data = { ...form, coverImage, gallery, paymentMethods: 'pse' }
            for (const field of numericFields) data[field] = data[field] === '' ? undefined : Number(data[field])
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
            await onSubmit(data)
        } catch {
            setUploadError('No se pudieron guardar los cambios. Revisa la conexión e inténtalo de nuevo.')
        } finally {
            setUploading(false)
        }
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
            {form.type === 'synthetic_field' && <>
                    <InputGroup columns={2}>
                        <Select id='space-field-type' name='fieldType' label='Tipo de cancha' value={form.fieldType} onChange={handleChange} options={SPACE.OPTIONS.FIELD_TYPES} />
                        <Input id='space-field-dimensions' name='fieldDimensions' label='Dimensiones' value={form.fieldDimensions} onChange={handleChange} />
                    </InputGroup>
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
            <div className='lx-f-space-recreational-section-header'><strong>3. Capacidad y características</strong></div>
            {form.type === 'event_hall'
                ? <InputGroup columns={2}>
                    <Input id='space-seated-capacity' name='seatedCapacity' type='number' min='0' label='Capacidad sentada' value={form.seatedCapacity} onChange={handleChange} />
                    <Input id='space-max-capacity' name='maxCapacity' type='number' min='0' label='Capacidad de pie' value={form.maxCapacity} onChange={handleChange} />
                </InputGroup>
                : <Input id='space-max-capacity' name='maxCapacity' type='number' min='0' label='Capacidad máxima' value={form.maxCapacity} onChange={handleChange} />}
            {form.type === 'synthetic_field'
                ? <>
                    <InputGroup columns={2}>
                        <Input id='space-total-area' name='totalArea' type='number' min='0' label='Área total (m²)' value={form.totalArea} onChange={handleChange} />
                        <Input id='space-bathrooms' name='bathrooms' type='number' min='0' label='Baños' value={form.bathrooms} onChange={handleChange} />
                    </InputGroup>
                    <Input id='space-parking-capacity' name='parkingCapacity' type='number' min='0' label='Cupos de parqueadero' value={form.parkingCapacity} onChange={handleChange} disabled={!form.hasParking} />
                </>
                : <InputGroup columns={2}>
                    <Input id='space-total-area' name='totalArea' type='number' min='0' label='Área total (m²)' value={form.totalArea} onChange={handleChange} />
                    <Input id='space-bathrooms' name='bathrooms' type='number' min='0' label='Baños' value={form.bathrooms} onChange={handleChange} />
                    <Input id='space-parking-capacity' name='parkingCapacity' type='number' min='0' label='Cupos de parqueadero' value={form.parkingCapacity} onChange={handleChange} disabled={!form.hasParking} />
                </InputGroup>}
            <div className='lx-f-space-recreational-checks'>
                {form.type === 'synthetic_field' && <>{checkbox('hasNets', 'Mallas')}{checkbox('hasBalls', 'Balones')}{checkbox('hasVests', 'Petos')}</>}
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
                {form.type === 'event_hall' && <>{checkbox('hasDanceFloor', 'Pista de baile')}{checkbox('hasFurniture', 'Mobiliario')}{checkbox('hasVIPArea', 'Área VIP')}</>}
                {checkbox('allowsAlcohol', 'Permite alcohol')}
                {checkbox('allowsFood', 'Permite alimentos')}
                {checkbox('allowsMusic', 'Permite música')}
            </div>
        </div>

        <div className='lx-f-space-recreational-section'>
            <div className='lx-f-space-recreational-section-header'><strong>4. Precios, reservas y horarios</strong></div>
            <Input id='space-price-hour' name='pricePerHour' type='number' min='0' label={form.type === 'synthetic_field' ? 'Precio por hora' : 'Precio por bloque'} value={form.pricePerHour} onChange={handleChange} required />
            <fieldset className='lx-f-space-recreational-payment-methods'>
                <legend>Métodos de pago</legend>
                <div className='lx-f-space-recreational-checks'>
                    <label className='lx-f-space-recreational-checkbox'>
                        <input type='checkbox' checked={form.paymentMethods === 'pse'} disabled readOnly />
                        PSE
                    </label>
                </div>
            </fieldset>
            <fieldset className='lx-f-space-recreational-reservations'>
                <legend>Reservas</legend>
                {form.type === 'synthetic_field'
                    ? <p>Se reserva por hora (mínimo 1 hora)</p>
                    : <Input id='space-reservation-unit-hours' type='number' min='3' max='8' step='1' label='Duración del bloque (horas)' value={form.reservationUnitMinutes / 60} onChange={event => setForm(current => ({ ...current, reservationUnitMinutes: Number(event.target.value) * 60 }))} />}
                {validationError && <p className='lx-f-space-recreational-validation-error' role='alert'>{validationError}</p>}
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
        </div>

        <div className='lx-f-space-recreational-section'>
            <div className='lx-f-space-recreational-section-header'><strong>5. Multimedia</strong></div>
            <div className='lx-f-space-recreational-image-field'>
                <strong>Portada</strong>
                <ImageUploader value={form.coverImage} setForm={setForm} name='coverImage' />
            </div>
            <div className='lx-f-space-recreational-image-field'>
                <strong>Galería (máximo 4 imágenes)</strong>
                <ImageUploader value={form.gallery} setForm={setForm} name='gallery' multiple maxFiles={4} />
            </div>
            {uploadError && <p className='lx-f-space-recreational-upload-error' role='alert'>{uploadError}</p>}
        </div>

        <div className='lx-f-space-recreational-actions'>
            <Button variant='bordered' color='auto' width='full' onClick={onCancel}>Cancelar</Button>
            <Button width='full' loading={uploading} disabled={uploading} onClick={submit}>{space ? 'Guardar cambios' : 'Registrar espacio'}</Button>
        </div>
    </div>
}

export default SpaceRecreationalForm