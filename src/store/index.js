import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import droppedObjectReducer from "./droppedObjectSlice";


const store = configureStore({
  reducer: {
    droppedObject: droppedObjectReducer,
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
