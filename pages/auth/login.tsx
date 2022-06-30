import axios, { AxiosError } from 'axios'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import AlreadyLoggedIn from '../../components/AlreadyLoggedIn'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Banner from '../../components/Banner'
import GithubLink from '../../components/GithubLink'

const Login: NextPage = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [invalid, setInvalid] = useState<boolean>(false)

    const [hasBeenInvalid, setHasBeenInvalid] = useState(false)

    const [userID, setUserID] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    useEffect(() => {
        async function getData() {
            const curUserID = localStorage.getItem('curUserID')
            if (curUserID) {
                setUserID(curUserID)
            }
        }
        getData()
    }, [])

    async function handleSubmit(e: any) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post('/api/Login', { username, password })
            setUserID(res.data._id)
            localStorage.setItem('curUserID', res.data._id)
            if (typeof window !== 'undefined') {
                window.location.pathname = '/user/dashboard'
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                const errMsg = err.response!.data.message
                if (errMsg === 'INVALID') {
                    setPassword('')
                    setInvalid(true)
                    setHasBeenInvalid(true)
                }
            }
        }
        setLoading(false)
    }

    return (
        <div className='w-screen h-screen'>
            {userID ? (
                <AlreadyLoggedIn />
            ) : (
                <div className='h-full flex flex-col gap-4 items-center justify-center text-center p-3'>
                    {invalid && (
                        <Banner
                            message='Incorrect username or password.'
                            type='error'
                            close={() => setInvalid(false)}
                        />
                    )}
                    <div>
                        <h1 className='text-xl font-bold'>
                            Login to Calcugrade to start tracking and making progress
                        </h1>
                    </div>
                    <form
                        action='#'
                        onSubmit={(e) => handleSubmit(e)}
                        className='flex flex-col gap-4 justify-center items-center outline outline-1 p-8 w-4/5 min-w-fit max-w-lg'>
                        <label className='flex flex-row gap-2'>
                            Username:
                            <input
                                className='transition-colors focus:outline-0 border-b-2 border-black focus:border-orange-500'
                                type='text'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <label className='opacity-0'>
                                <FontAwesomeIcon icon={faEyeSlash} />

                                <input
                                    className='hidden'
                                    type='checkbox'
                                    checked={showPassword}
                                    onChange={(e) => {}}
                                />
                            </label>
                        </label>
                        <label className='flex flex-row gap-2'>
                            Password:
                            <input
                                className='transition-colors focus:outline-0 border-b-2 border-black focus:border-orange-500'
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label className='cursor-pointer'>
                                {showPassword ? (
                                    <FontAwesomeIcon icon={faEyeSlash} />
                                ) : (
                                    <FontAwesomeIcon icon={faEye} />
                                )}
                                <input
                                    className='hidden'
                                    type='checkbox'
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                />
                            </label>
                        </label>
                        <button
                            className='transition-colors focus:outline-0 border-b-2 border-black px-1 text-black hover:text-orange-500 hover:border-orange-500 focus:text-orange-500 focus:border-orange-500 font-semibold'
                            type='submit'>
                            {loading ? 'Loading...' : 'Log in'}
                        </button>
                        {hasBeenInvalid && (
                            <Link
                                className='hover:font-bold cursor-pointer'
                                href='/auth/forgot-password'>
                                I forgot my password
                            </Link>
                        )}
                    </form>
                    <div className=''>
                        Don't have an account yet?{' '}
                        <div className='transition-colors inline text-orange-500 font-bold hover:text-black'>
                            <Link href='/auth/signup'>Signup instead.</Link>
                        </div>
                    </div>
                </div>
            )}
            <GithubLink />
        </div>
    )
}

export default Login
