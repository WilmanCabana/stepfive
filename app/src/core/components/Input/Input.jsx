/* eslint-disable react/prop-types */
import './Input.css'

const Input = ({ id, value, name, label, error, required = false, ...props }) => {
    return (
        <div className='lx-forms-input-field'>
            <div className={`lx-forms-input-group ${error ? '--error' : ''}`}>
                <input 
                    id={id} 
                    className='lx-forms-input' 
                    name={name} 
                    value={value ?? ''} 
                    aria-invalid={!!error}
                    required={required}
                    {...props} 
                />
                <label htmlFor={id} className='lx-forms-label'>
                    {label}{required && <span className='required-asterisk lx-text-color-accent' aria-hidden='true'> *</span>}
                </label>
            </div>
            {error && <span className='lx-forms-error'>{error}</span>}
        </div>
    )
}

export default Input