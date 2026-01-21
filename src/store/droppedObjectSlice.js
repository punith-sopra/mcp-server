import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  droppedObjectData: {
    initialDraggedData: [],
    draggedData: {}, // Dragged object details
    versions: [], // Object versions (revisions)
    parentDetails: [], // Parent metadata
    ownerData: {} /* data from cardOwnerResult */,
  },
  plantObjectData: {
    allPlants: [],
    initialAssignedPlants: [],
    uniquePlants: [],
    productChildren: [],
    CAName: false,
    headers: {},
    proposedChanges: [],
  },
  loadingParentDetails: false, // Loading state for parent metadata
  isDropped: false, // Indicates whether an object has been dropped
  selectedTableRows: [],
};

const droppedObjectSlice = createSlice({
  name: "droppedObject",
  initialState,
  reducers: {
    setInitialDroppedObjectData: (state, action) => {
      state.droppedObjectData.initialDraggedData =
        action.payload.initialDraggedData;
    },
    setDroppedObjectData: (state, action) => {
      state.droppedObjectData = {
        ...state.droppedObjectData,
        ...action.payload,
      };
    },
    setPlantObjectData: (state, action) => {
      state.plantObjectData = {
        ...state.plantObjectData,
        ...action.payload,
      };
    },
    setProductChildren: (state, action) => {
      state.plantObjectData.productChildren = action.payload;
    },
    setProposedChanges: (state, action) => {
      state.plantObjectData.proposedChanges = action.payload;
    },
    setHeaders: (state, action) => {
      state.plantObjectData.headers = action.payload;
    },
    setCAName: (state, action) => {
      state.plantObjectData.CAName = action.payload;
    },

    setParentDetailsLoading: (state, action) => {
      state.loadingParentDetails = action.payload;
    },
    setIsDropped: (state, action) => {
      state.isDropped = action.payload;
    },
    setSelectedTableRows: (state, action) => {
      state.selectedTableRows = action.payload;
    },
  },
});

export const {
  setInitialDroppedObjectData,
  setDroppedObjectData,
  setPlantObjectData,
  setProductChildren,
  setCAName,
  setHeaders,
  setParentDetailsLoading,
  setIsDropped,
  setSelectedTableRows,
  setProposedChanges,
} = droppedObjectSlice.actions;
export default droppedObjectSlice.reducer;
