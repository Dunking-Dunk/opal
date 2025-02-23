'use client'

import { getWorkspaceFolders } from '@/actions/workspace'
import FolderDuotone from '@/components/icons/folder-duotone'
import { useQueryData } from '@/hooks/useQueryData'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import React from 'react'
import Folder from './folder'
import { useMutationDataState } from '@/hooks/useMutationData'
import { FoldersProps } from '@/types/index.type'
import { useDispatch } from 'react-redux'
import { FOLDERS } from '@/redux/slices/folders'

type Props = {
    workspaceId: string
}

const Folders = ({ workspaceId }: Props) => {
    const dispatch = useDispatch()
    const { data, isFetched } = useQueryData(['workspace-folders', workspaceId], () => getWorkspaceFolders(workspaceId))

    const { latestVariables } = useMutationDataState(['create-folder'])

    const { status, data: folders } = data as FoldersProps

    if (isFetched && folders) {
        dispatch(FOLDERS({ folders: folders }))
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <FolderDuotone />
                    <h2 className='text-[#bdbdbd] text-xl'>Folders</h2>
                </div>
                <div className='flex items-center gap-2'>
                    <p className='text-[#bdbdbd]'>See All</p>
                    <ArrowRight color='#707070' />
                </div>
            </div>
            <section className={cn(status !== 200 && 'justify-center', 'flex items-center gap-4 overflow-x-auto w-full')}>
                {status !== 200 ? <p className='text-neutral-300'>No Folders</p> : (
                    <>
                        {latestVariables && latestVariables.status === 'pending' && (
                            <Folder name={latestVariables.variables.name} id={latestVariables.variables.id} optimistic workspaceId={workspaceId} />
                        )}
                        {folders.map((folder) => <Folder name={folder.name} id={folder.id} count={folder._count.videos} key={folder.id} workspaceId={workspaceId} />)}
                    </>
                )
                }
            </section>
        </div>
    )
}

export default Folders