import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import "../../styles/Navbar.css"
function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const nameUser = localStorage.getItem('nameUser');
    const lastnameUser = localStorage.getItem('lastnameUser');
    const type = localStorage.getItem('type');

    return (
        <>
            <nav >
                {/* <Link to="/home" className='title' > */}
                <div className='title' >


                    {type === "0" ?
                        <Link to="/Home">
                            <img className='nav-logo' src='img/logo.png' alt='logo' />
                        </Link> :
                        <Link to="/dashboard">
                            <img className='nav-logo' src='img/logo.png' alt='logo' />
                        </Link>
                    }
                    <div className='user-login'>{nameUser} {lastnameUser} </div>


                </div>

                <div className="menu" onClick={() => { setMenuOpen(!menuOpen) }}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <ul className={menuOpen ? "open" : ""}>
                    {type === "0" ?
                        <>
                            <li><NavLink to='/Home'>หน้าหลัก</NavLink></li>
                            <li><NavLink to='/Dashboard'>ประวัติเช็คอิน</NavLink></li>
                        </>
                        :
                        <>
                            <li><NavLink to='/Dashboard'>ประวัติเช็คอิน</NavLink></li>
                            <li><NavLink to='/UserPage'>ผู้ใช้งาน</NavLink></li>
                            <li><NavLink to='/Advert'>โฆษณา</NavLink></li>
                            <li><NavLink to='/Location'>ตำแหน่งจุดเช็คอิน</NavLink></li>
                        </>
                    }
                    <li><NavLink to='/Login'>ล็อกเอ้า</NavLink></li>
                </ul>
            </nav>
        </>
    )
}

export default Navbar