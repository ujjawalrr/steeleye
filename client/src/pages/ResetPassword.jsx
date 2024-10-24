import { Input, notification } from 'antd'
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const ResetPassword = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const params = useParams()
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
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
        if(!params.user_id || !params.token) {
            openNotification('Invalid reset link!', 'error')
            return
        }
        if(!password || !confirmPassword) {
            openNotification('Please fill in all fields!', 'warning')
            return
        }
        if(password !== confirmPassword) {
            openNotification('Passwords do not match!', 'warning')
            return
        }
        try {
            setLoading(true)
            const response = await axios.post(`/api/reset-password/${params.user_id}/${params.token}`, { password })
            openNotification('Password changed successfully!', 'success')
            login(response.data)
            navigate('/')
        } catch (error) {
            openNotification(error.response.data.detail || 'Something went wrong!', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='space-y-4 px-4 sm:px-12 py-4 lg:py-8 mx-auto max-w-[500px]'>
            {searchParams.get('first') ?
            <>
                <h1 className='text-center text-3xl font-semibold pb-3'>Welcome to Steel Eye!</h1>
                <p className='text-center text-2xl pb-8'>Set your password to continue!</p>
            </>
            :
                <h1 className='text-center text-3xl font-semibold pb-8'>Reset Password!</h1>
            }
            <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
            <div className='flex justify-center items-center gap-2'>
                    <label className='min-w-[150px]'>Password</label>
                    <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type='password'
                        className='w-full'
                        placeholder='Enter Password'
                        required
                    />
                </div>
                <div className='flex justify-center items-center gap-2'>
                    <label className='min-w-[150px]'>Confirm Password</label>
                    <Input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type='password'
                        className='w-full'
                        placeholder='Confirm Password'
                        required
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

export default ResetPassword
