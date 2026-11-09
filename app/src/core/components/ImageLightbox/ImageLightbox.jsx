import './ImageLightbox.css'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import Icon from '../Icon/Icon'

const ImageLightbox = ({ images, initialIndex = 0, onClose }) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex)
    const image = images[activeIndex]

    useEffect(() => {
        setActiveIndex(initialIndex)
    }, [initialIndex])

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation()
                onClose()
            }
            if (images.length < 2) return
            if (event.key === 'ArrowRight') {
                event.preventDefault()
                setActiveIndex(index => (index + 1) % images.length)
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault()
                setActiveIndex(index => (index - 1 + images.length) % images.length)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [images.length, onClose])

    if (!image) return null

    const previousImage = () => setActiveIndex(index => (index - 1 + images.length) % images.length)
    const nextImage = () => setActiveIndex(index => (index + 1) % images.length)

    return createPortal(
        <div className='lx-c-image-lightbox' role='dialog' aria-modal='true' aria-label='Visor de imágenes' onClick={event => {
            if (event.target === event.currentTarget) onClose()
        }}>
            <button type='button' className='lx-c-image-lightbox-close' onClick={onClose} aria-label='Cerrar visor'>
                <Icon name='close' />
            </button>
            {images.length > 1 && <>
                <button type='button' className='lx-c-image-lightbox-nav --previous' onClick={previousImage} aria-label='Imagen anterior'>
                    <Icon name='chevron_left' />
                </button>
                <button type='button' className='lx-c-image-lightbox-nav --next' onClick={nextImage} aria-label='Imagen siguiente'>
                    <Icon name='chevron_right' />
                </button>
            </>}
            <figure className='lx-c-image-lightbox-content'>
                <img src={image.src} alt={image.alt} />
                {images.length > 1 && <figcaption>{activeIndex + 1} / {images.length}</figcaption>}
            </figure>
        </div>,
        document.body
    )
}

ImageLightbox.propTypes = {
    images: PropTypes.arrayOf(PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired
    })).isRequired,
    initialIndex: PropTypes.number,
    onClose: PropTypes.func.isRequired
}

export default ImageLightbox
