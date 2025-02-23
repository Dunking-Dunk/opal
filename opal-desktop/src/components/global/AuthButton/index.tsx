import { SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'

const AuthButton = () => {
    return (
        <SignedOut>
            <div className='flex gap-x-3 h-screen justify-center items-center'>
                <SignInButton>
                    <Button className='px-10 rounded-full hover:pg-gray-200' variant={'outline'}>
                        Sign In
                    </Button>
                </SignInButton>
                <SignUpButton>
                    <Button className='px-10 rounded-full' variant={'default'}>
                        Sign up
                    </Button>
                </SignUpButton>
            </div>
        </SignedOut>
    )
}

export default AuthButton