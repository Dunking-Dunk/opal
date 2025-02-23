import { getUserProfile } from '@/actions/user';
import FormGenerator from '@/components/global/form-generator';
import Loader from '@/components/global/loader';
import { Button } from '@/components/ui/button';
import { useQueryData } from '@/hooks/useQueryData';
import { useVideoComment } from '@/hooks/useVideoComment'
import { Send, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react'

type Props = {
    videoId: string;
    commentId?: string;
    close?: () => void;
    author: string
}

const CommentForm = ({
    videoId,
    commentId,
    author,
    close
}: Props) => {
    const router = useRouter()
    const { data } = useQueryData(['user-profile'], getUserProfile)
    const { status } = data as { status: number }
    const { register, isPending, errors, onFormSubmit } = useVideoComment(videoId, commentId)

    if (status !== 404) {
        return (
            <form className='relative w-full' onSubmit={onFormSubmit}>
                {
                    close && (
                        <X
                            onClick={close}
                            size={18}
                            className='absolute right-3 top-3 text-white/50 cursor-pointer hover:text-white/80'
                        />
                    )
                }
                <FormGenerator
                    register={register}
                    errors={errors}
                    name='comment'
                    inputType='textarea'
                    lines={4}
                    type='text'
                    placeholder={`Respond to ${author}...`}
                />
                <Button
                    className='p-0 bg-transparent absolute bottom-2 right-3 hover:bg-transparent'
                    type='submit'
                >
                    <Loader state={isPending}>
                        <Send size={18} className='text-white/50 cursor-pointer hover:text-white' />
                    </Loader>
                </Button>
            </form>
        )
    } else {
        return (
            <div className='flex items-center gap-x-4'>
                <p>You have to be signed in before posting a comment</p>
                <Button onClick={() => router.push('/auth/sign-in')}>Sign in</Button>
            </div>
        )
    }

}

export default CommentForm