import './ImageUploader.css'
import { useRef, useEffect, useState } from 'react'
import Button from '../Button/Button'
import Icon from '../Icon/Icon'
import Logo from '../Logo/Logo'

const ImageUploader = ({ value, setForm, name, multiple = false, maxFiles = 1 }) => {
    const imageInputRef = useRef(null)
    const [previews, setPreviews] = useState([])

    useEffect(() => {
        const values = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])
        const nextPreviews = values.map(item => {
            const isFile = typeof File !== 'undefined' && item instanceof File
            return { src: isFile ? URL.createObjectURL(item) : item, isFile }
        })
        setPreviews(nextPreviews)
        return () => {
            nextPreviews.filter(preview => preview.isFile).forEach(preview => URL.revokeObjectURL(preview.src))
        }
    }, [value, multiple])

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || [])
        if (multiple && files.length) {
            setForm(prev => ({
                ...prev,
                [name]: [...(Array.isArray(prev[name]) ? prev[name] : []), ...files].slice(0, maxFiles)
            }))
        } else if (files[0]) {
            setForm(prev => ({
                ...prev,
                [name]: files[0]
            }))
        }
        event.target.value = ''
    }

    const handleImageInputClick = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click()
        }
    }

    const handleImageRemove = (index) => {
        setForm(prev => ({
            ...prev,
            [name]: multiple ? prev[name].filter((_, itemIndex) => itemIndex !== index) : ''
        }))
    }

    const canAddImage = !multiple || previews.length < maxFiles

    return (
        <div className='lx-c-image-uploader-container'>
            <div className={`lx-c-image-uploader${multiple ? ' --multiple' : ''}`}>
                {previews.length
                    ? previews.map((preview, index) => <div className='lx-c-image-uploader-item' key={`${preview.src}-${index}`}>
                        <img className='--image' src={preview.src} alt={`Imagen ${index + 1}`} />
                        <button type='button' className='lx-c-image-uploader-remove' onClick={() => handleImageRemove(index)} aria-label={`Eliminar imagen ${index + 1}`}>
                            <Icon name='close' />
                        </button>
                    </div>)
                    : <button type='button' className='lx-c-image-uploader-empty' onClick={handleImageInputClick} aria-label='Agregar imagen'><Logo size='s' color='ghost' /></button>}
            </div>

            <div className='lx-c-image-uploader-actions'>
                {canAddImage && <Button size='xs' radius='full' color='auto' variant='bordered' onClick={handleImageInputClick}>
                    <Icon name={previews.length ? 'add' : 'image_arrow_up'} />
                    {previews.length ? 'Agregar imagen' : 'Agregar imagen'}
                </Button>}
            </div>

            <div className='lx-forms-input-group-hidden'>
                <input
                    onChange={handleImageChange}
                    ref={imageInputRef}
                    className='lx-forms-input'
                    id={`${name}-input`}
                    name={name}
                    type='file'
                    accept="image/png, image/jpeg, image/webp, .png, .jpg, .webp"
                    multiple={multiple}
                    autoComplete='off'
                />
                <label htmlFor={`${name}-input`} className='lx-forms-label'>Imagen</label>
            </div>
        </div>
    )
}

export default ImageUploader
