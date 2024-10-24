import { Input, notification } from 'antd'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const searchParams = new URLSearchParams(window.location.search)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const openNotification = (message, type) => {
        notification[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post('/api/login', { email, password })
            openNotification('Logged in successfully!', 'success')
            login(response.data)
            navigate('/')
        } catch (error) {
            if (error.response.status === 402) {
                const { user_id, token } = error.response.data.detail;

                navigate(`/reset-password/${user_id}/${token}?first=true`)

                openNotification('Set your password to continue!', 'warning');
                return;
            }
            openNotification(error.response.data.detail || 'Something went wrong!', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='space-y-4 px-4 sm:px-12 py-4 lg:py-8 mx-auto max-w-[500px]'>
            <h1 className='text-center text-3xl font-semibold pb-8'>Login{searchParams.get('admin') && ' with admin account'}!</h1>
            <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                <div className='flex justify-center items-center gap-2'>
                    <label className='min-w-[100px]'>Email</label>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type='email'
                        className='w-full'
                        placeholder='Enter Email'
                    />
                </div>
                <div className='flex justify-center items-center gap-2'>
                    <label className='min-w-[100px]'>Password</label>
                    <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type='password'
                        className='w-full'
                        placeholder='Enter Password'
                    />
                </div>
                <div className='flex justify-end pt-4'>
                    <button disabled={loading} className='bg-orange-950 p-2 min-w-16 rounded-md hover:bg-opacity-90 text-white'>
                        {loading ? 'Submitting' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login
