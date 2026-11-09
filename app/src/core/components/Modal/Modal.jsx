import './Modal.css'
import { useEffect, useId, useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../Button/Button'
import Loader from '../Loader/Loader'

const Modal = ({ show, title, position = 'center', size = 'middle', className = '', children, onClose }) => {
  const [active, setActive] = useState(show)
  const titleId = useId()

  useEffect(() => {
    let timeout
    if (show) {
      setActive(true)
    } else {
      timeout = setTimeout(() => setActive(false), 500)
    }
    return () => clearTimeout(timeout)
  }, [show])


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }
    if (show) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show, onClose])

  const handleBackdropClick = (event) => {
    if (event.target.classList.contains('lx-c-modal')) {
      onClose?.()
    }
  }

  if (!active) return null

  return (
    <div
      className={`lx-c-modal ${position} ${size} ${className} ${show ? '--active' : '--inactive'}`}
      onClick={handleBackdropClick}
    >
      <div className='lx-c-modal-container' role='dialog' aria-modal='true' aria-labelledby={titleId}>
        <Loader loading={!show} animated={false} />
        <div className='lx-c-modal-header'>
          <h3 id={titleId}>{title}</h3>
          <Button size='xs' color='auto' variant='plain' icon ariaLabel='Cerrar' onClick={onClose}>
            <span className='material-symbols-rounded' translate='no'>close</span>
          </Button>
        </div>
        <div className='lx-c-modal-content'>
          {children}
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['center', 'left', 'right']),
  size: PropTypes.oneOf(['min', 'middle', 'standar', 'large', 'max', 'full']),
  className: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
}

export default Modal