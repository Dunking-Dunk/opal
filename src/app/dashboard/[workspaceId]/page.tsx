import CreateFolders from '@/components/global/create-folders'
import CreateWorkspace from '@/components/global/create-workspace'
import Folders from '@/components/global/folders'
import Videos from '@/components/global/videos'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import React from 'react'

type Props = {
    params: { workspaceId: string }
}

const page = ({ params: { workspaceId } }: Props) => {
    return (
        <div>
            <Tabs defaultValue='videos' className='mt-6'>
                <div className='flex w-full justify-between items-center'>
                    <TabsList className='bg-transparent gap-2 pl-0`'>
                        <TabsTrigger value='videos' className='P-[13px] px-6 rounded-full data-[state=active]:bg-[#252525]'>
                            Videos
                        </TabsTrigger>
                        <TabsTrigger value='archive' className='P-[13px] px-6 rounded-full data-[state=active]:bg-[#252525]'>
                            Archive
                        </TabsTrigger>
                    </TabsList>
                    <div className='flex gap-x-3'>
                        <CreateWorkspace />
                        <CreateFolders workspaceId={workspaceId} />
                    </div>
                </div>
                <section className='py-9'>
                    <TabsContent value='videos'>
                        <Folders workspaceId={workspaceId} />
                        <Videos workspaceId={workspaceId} videosKey='user-videos' folderId={workspaceId} />
                    </TabsContent>
                </section>
            </Tabs>
        </div>
    )
}

export default page