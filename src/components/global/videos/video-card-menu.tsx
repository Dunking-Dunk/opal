import React from 'react'
import Modal from '../modal';
import { Move } from 'lucide-react';
import ChangeVideoLocation from '@/components/forms/change-video-location';

type Props = {
    videoId: string;
    currentWorkspace?: string;
    currentFolder?: string;
    currentFolderName?: string;
}

const VideoCardMenu = ({
    videoId,
    currentWorkspace,
    currentFolder,
    currentFolderName,
}: Props) => {
    return (
        <Modal className='flex items-center cursor-pointer gap-x-2'
            title='Move to new Workspace/Folder'
            description='This action cannot be undone. This will permanently delete your shit'
            trigger={
                <Move className='text-[#4f4f4f]' fill='#4f4f4f' size={20} />
            }
        >
            <ChangeVideoLocation currentFolder={currentFolder} videoId={videoId}
                currentWorkspace={currentWorkspace} currentFolderName={currentFolderName} />
        </Modal>
    )
}

export default VideoCardMenu