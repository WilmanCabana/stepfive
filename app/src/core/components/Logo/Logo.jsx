import './Logo.css'
import PropTypes from 'prop-types'

function Logo({ size, color, className }) {
    const fill = `var(--lx-color-${['accent', 'auto', 'ghost', 'black', 'white', 'gray', 'success', 'warning', 'danger'].includes(color) ? color : 'accent'})`
    const detailFill = color === 'white' ? 'var(--lx-color-logo-detail)' : 'var(--lx-color-background-primary)'

    return (
        <div className={`lx-c-logo lx-c-logo-size-${['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'].includes(size) ? size : 'm'}`}>
            <svg
                className={className}
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 100 100'
                role='img'
                aria-label='Stepfive'
                focusable='false'
            >
                <path fill={fill} d='M12 7 34 15 50 11 66 15 88 7 82 34 94 43 84 68 70 82 56 88 50 96 44 88 30 82 16 68 6 43 18 34Z' />
                <path fill={detailFill} d='m22 27 17 10-13 3-7-5Zm56 0L61 37l13 3 7-5ZM38 57l12 5 12-5-5 15-7 8-7-8Z' />
                <path fill={fill} d='m28 42 13 3-9 5Zm44 0-13 3 9 5Z' />
                <path fill={detailFill} d='m44 75 6 4 6-4-6 12Z' />
            </svg>
        </div>
    )
}

Logo.propTypes = {
    size: PropTypes.oneOf(['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl']),
    color: PropTypes.oneOf(['accent', 'auto', 'ghost', 'black', 'white', 'gray', 'success', 'warning', 'danger']),
    className: PropTypes.string,
}

export default Logo
