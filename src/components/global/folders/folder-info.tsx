"use client"

import { getFolderInfo } from '@/actions/workspace'
import { useQueryData } from '@/hooks/useQueryData'
import { FolderProps } from '@/types/index.type'
import React from 'react'

type Props = {
    folderId: string
}

const FolderInfo = ({ folderId }: Props) => {
    const { data, isFetched } = useQueryData(["folder-info", folderId], () => getFolderInfo(folderId))

    const { data: folder } = data as FolderProps

    return (
        <div className='flex items-center'>
            <h2 className='text-[#8d8d8d] text-2xl'>{folder.name}</h2>
        </div>
    )
}

export default FolderInfo