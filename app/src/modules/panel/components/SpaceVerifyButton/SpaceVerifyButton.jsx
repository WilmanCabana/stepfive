/* eslint-disable react/prop-types */
import './SpaceVerifyButton.css'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import SpaceRecreationalRequester from '../../services/SpaceRecreationalRequester.mjs'

const SpaceVerifyButton = ({ space, onVerified }) => {
    const verify = async (verificationStatus) => {
        const result = await SpaceRecreationalRequester.verifySpace(space, verificationStatus)
        if (result) onVerified(result)
    }

    if (!space || space.verificationStatus !== 'pending') return null

    return <div className='lx-space-verify-actions'>
        <Button size='xs' color='success' onClick={() => verify('approved')}><Icon name='check' />Aprobar</Button>
        <Button size='xs' color='danger' onClick={() => verify('rejected')}><Icon name='close' />Rechazar</Button>
    </div>
}

export default SpaceVerifyButton
