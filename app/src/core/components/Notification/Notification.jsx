import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './Notification.css'

const Notification = ({ message = '', type = 'info', duration = 3000 }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const showTimeout = setTimeout(() => setVisible(true), 10)
        const hideTimeout = setTimeout(() => setVisible(false), duration - 200)

        return () => {
            clearTimeout(showTimeout)
            clearTimeout(hideTimeout)
        }
    }, [duration])

    return (
        <div
            className={`lx-c-notification ${visible ? '--show' : '--hide'
                }`}
            role={type === 'error' ? 'alert' : 'status'}
            aria-live={type === 'error' ? 'assertive' : 'polite'}
            aria-atomic='true'
        >
            <span className={`lx-c-notification-indicator --${type}`} />
            {message}
        </div>
    )
}

Notification.propTypes = {
    message: PropTypes.string,
    type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
    duration: PropTypes.number,
}

export default Notification