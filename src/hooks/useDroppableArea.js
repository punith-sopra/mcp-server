import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setDroppedObjectData,
} from "../store/droppedObjectSlice";
import { setIsDropped as setIsDroppedAction } from "../store/droppedObjectSlice";
// Custom hook
import useRevisions from "./useRevisions";
// Reusable services
import {
  initializeDroppableArea as initDroppable,
  // fetchCsrfTokenAndDependencies as fetchCsrfService,
  getDroppedObjectDetails,
  // fetchCardOwnerDetails as fetchCardOwnerDetailsService,
} from "../services/api/droppableService";
import useToast from "../hooks/useToast";
import {
  MSG_FETCH_OBJECT_DETAILS_FAILED,
  MSG_INVALID_OBJECT_TYPE,
  MSG_UNEXPECTED_ERROR,
} from "../utils/toastMessages";

const useDroppableArea = () => {
  const { showErrorToast } = useToast();
  const { fetchRevisionsAndParents } = useRevisions();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  // const isDropped = useSelector((state) => state.droppedObject.isDropped);

  const fetchObjectDetails = useCallback(
    async (dataItems) => {
      try {
        const objectDetailsResult = await getDroppedObjectDetails({
          dataItems,
        });

        if (objectDetailsResult.success) {
          // Merge the data from both services
          dispatch(
            setDroppedObjectData({
              draggedData: objectDetailsResult.data.draggedData,
            })
          );

          dispatch(setIsDroppedAction(true));

          // call revisions and parents after successfully fetching object details
          const relativePath =
            objectDetailsResult.data.draggedData.relativePath;
          await fetchRevisionsAndParents(
            dataItems[0]?.objectId,
            dataItems[0]?.objectType,
            relativePath
          );
        } else {
          showErrorToast(MSG_FETCH_OBJECT_DETAILS_FAILED);
        }
      } catch (error) {
        console.error("[FetchObjectDetails] Error fetching details:", error);
        showErrorToast(MSG_FETCH_OBJECT_DETAILS_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, fetchRevisionsAndParents, showErrorToast]
  );

  const handleDrop = useCallback(
    async (dataItems) => {
      setLoading(true); // Start loading state
      console.log("[handleDrop] handleDrop called with dataItems:", dataItems);

      try {
        if (dataItems && dataItems.length > 0) {
          // Validate object type
          const objectType = dataItems[0]?.objectType;
          const validTypes = ["VPMReference", "Document", "Raw_Material"];
          if (!validTypes.includes(objectType)) {
            showErrorToast(MSG_INVALID_OBJECT_TYPE);
            setLoading(false);
            return;
          }

          await fetchObjectDetails(dataItems);
        } else {
          console.warn("[handleDrop] No data items to process.");
        }
      } catch (error) {
        console.error("[Drop] Error in handleDrop:", error);
        setLoading(false);
        console.log(
          "[handleDrop] Error in handleDrop, setting loading to false"
        );
        showErrorToast(MSG_UNEXPECTED_ERROR);
      }
    },
    [fetchObjectDetails, showErrorToast, dispatch]
  );
  // Initialize droppable area
  const initializeDroppableArea = useCallback(() => {
    dispatch(setIsDroppedAction(false));
    const interval = setInterval(() => {
      const droppableContainer = document.querySelector(".droppable-container");
      if (droppableContainer) {
        clearInterval(interval);
        initDroppable(droppableContainer, handleDrop, dispatch, showErrorToast);
      }
    }, 100); // Check every 100ms

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [handleDrop, dispatch]);

  return {
    initializeDroppableArea,
    loading,
    handleDrop,
  };
};

export default useDroppableArea;
