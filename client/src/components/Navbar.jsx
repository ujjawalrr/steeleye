import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className='bg-orange-950 w-full h-[60px] px-4 sm:px-8 flex flex-col justify-center text-white'>
            <div className="flex justify-between items-center">
                <NavLink to='/'>Steel Eye | IIT Kharagpur</NavLink>
                <div className="flex gap-8 items-center">
                    <NavLink to='/manage-units'>
                        Manage Units
                    </NavLink>
                    <NavLink to='/manage-ladles'>
                        Manage Ladles
                    </NavLink>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
