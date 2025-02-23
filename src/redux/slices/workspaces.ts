import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateProps = {
    workspaces: {
        id: string,
        name: string
        type: 'PUBLIC' | 'PERSONAL'
    }[]
}

const initialState: initialStateProps = {
    workspaces: []
}

export const Workspaces = createSlice({
    name: 'workspaces',
    initialState,
    reducers: {
        WORKSPACES: (state, action: PayloadAction<initialStateProps>) => {
            return { ...action.payload }
        }
    }
})

export const { WORKSPACES } = Workspaces.actions
export default Workspaces.reducer