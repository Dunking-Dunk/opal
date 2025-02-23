"use client"

import { getPreviewVideo, sendEmailForFirstView } from '@/actions/workspace'
import { useQueryData } from '@/hooks/useQueryData'
import { VideoProps, VideosProps } from '@/types/index.type'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import CopyLink from '../copy-link'
import RichLink from '../rich-link'
import { truncateString } from '@/lib/utils'
import { Download } from 'lucide-react'
import TabMenu from '../../tabs'
import AiTools from '../../ai-tools'
import VideoTranscript from '../../video-transcript'
import Activities from '../../activities'

type Props = {
    videoId: string
}

const VideoPreview = ({ videoId }: Props) => {
    const router = useRouter()
    const pathname = usePathname()

    const { data, isFetching } = useQueryData(['preview-video', videoId], () => getPreviewVideo(videoId))

    const notifyFirstView = async () => await sendEmailForFirstView(videoId)

    const { data: video, status, author, authenticated } = data as VideoProps

    const statuses = [200, 201]
    if (!video || !statuses.includes(status)) {
        useEffect(() => {
            router.push('/');
        }, []);
        return null;
    }

    const daysAgo = Math.floor((new Date().getTime() - video.createdAt.getTime()) / (24 * 60 * 60 * 1000))

    useEffect(() => {
        if (video.views === 0) {
            notifyFirstView()
        }

        return () => {
            notifyFirstView()
        }
    }, [])

    return (
        <div className={`grid grid-col-1 xl:grid-cols-3 ${pathname.split('/').includes('preview') ? 'lg:px-20' : 'lg:px-0'} px-6 lg:py-10 overflow-y-auto gap-5
`}>
            <div className='flex flex-col lg:col-span-2 gap-y-10'>
                <div>
                    <div className='flex gap-x-5 items-center justify-between'>
                        <h2 className='text-white text-4xl font-bold'>{video.title}</h2>
                    </div>
                    <span className='flex gap-x-3'>
                        <p className='text-[#9d9d9d] capitalize'>{video.User?.firstname} {video.User?.lastname}</p>
                        <p className='text-[#707070]'>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</p>
                    </span>
                </div>
                <video controls preload='metadata' className='w-full aspect-video opacity-50 rounded-xl' >
                    <source src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${video.source}#t=1`} />
                </video>
                <div className='flex flex-col text-2xl gap-y-4'>
                    <div className='flex gap-x-5 items-center justify-between'>
                        <p className='text-[#bdbdbd] text-semibold'>
                            Description
                        </p>
                        {/* {author ? (
                            <EditVideo videoId={videoId} title={video.title} description={video.description as string} />
                        )} */}
                    </div>
                    <p className='text-[#9d9d9d] text-lg text-medium'>{video.description}</p>
                </div>
            </div>
            <div className='lg:col-span-1 flex flex-col gap-y-16'>
                <div className='flex justify-end items-center gap-x-3'>
                    <CopyLink variant={'outline'} className='rounded-full bg-transparent px-10' videoId={videoId} />
                    <RichLink description={truncateString(video.description as string, 150)} id={videoId} source={video.source} title={video.title as string} />
                    <Download className='text-[#9d9d9d]' />
                </div>
                <div>
                    <TabMenu defaultValue={authenticated ? 'Ai tools' : 'Activity'} triggers={authenticated ? ['Ai tools', 'Transcript', 'Activity'] : ['Transcript', 'Activity']}>
                        <AiTools videoId={videoId} plan={video.User?.subscription?.plan!} trial={video.User?.trial!} />
                        <VideoTranscript transcript={video.summery} />
                        <Activities author={video.User?.firstname as string} videoId={videoId} />
                    </TabMenu>
                </div>
            </div>
        </div>
    )
}

export default VideoPreview