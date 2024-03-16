import { Outlet } from 'react-router-dom';

function UnsignedUserLayout() {
    return (
        <div className='pt-5'>
            <Outlet />
        </div>
    );
}

export default UnsignedUserLayout;
