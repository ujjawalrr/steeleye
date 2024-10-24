import { Input } from 'antd'
import React, { useState } from 'react'
import axios from 'axios'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post('/api/login', { email, password })
            console.log(response.data)
        } catch (error) {
            console.error('Login failed:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen space-y-4 px-4 sm:px-12 py-4 lg:py-8 mx-auto max-w-[350px]'>
            <h1 className='text-center'>Login!</h1>
            <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                <div className='flex justify-center items-center gap-2'>
                    <label className='min-w-[100px]'>Email</label>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type='text'
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
