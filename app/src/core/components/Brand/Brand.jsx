import './Brand.css'
import PropTypes from 'prop-types'
import Logo from '../Logo/Logo'

function Brand({ size, color = 'accent', className }) {
    const brandSize = ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'].includes(size) ? size : 'm'

    return (
        <div className={`lx-c-brand lx-c-brand-size-${brandSize}`}>
            <Logo size='xxs' color={color} className={className} />
            <span>Stepfive</span>
        </div>
    )
}

Brand.propTypes = {
    size: PropTypes.oneOf(['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl']),
    color: PropTypes.oneOf(['accent', 'auto', 'ghost', 'black', 'white', 'gray', 'success', 'warning', 'danger']),
    className: PropTypes.string,
}

export default Brand
