
import {configureStore} from '@reduxjs/toolkit'

import counterReducer from '../states/CounterSlicer'

export const store = configureStore({
  reducer: {counterReducer},
})


export type Rootstate = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


