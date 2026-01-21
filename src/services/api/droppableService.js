import { callwebService,getTenant } from "../../utils/helpers";
import { setInitialDroppedObjectData } from "../../store/droppedObjectSlice";
import api from "../../utils/api";

export const initializeDroppableArea = (
  droppableContainer,
  handleDrop,
  dispatch,
  showErrorToast
) => {
  window.require(["DS/DataDragAndDrop/DataDragAndDrop"], (DataDragAndDrop) => {
    DataDragAndDrop.droppable(droppableContainer, {
      drop: (data) => {
        console.log("[DragAndDrop] Drop event:", data);
        const parsedData = JSON.parse(data);
        const dataItems = parsedData.data.items;
        // Check if more than one object is being dropped
        if (dataItems.length > 1) {
          
          droppableContainer.classList.remove("drag-over");
          return; // Stop further execution
        }
        dispatch(
          setInitialDroppedObjectData({
            initialDraggedData: JSON.parse(data),
          })
        );
        handleDrop(dataItems);
        droppableContainer.classList.remove("drag-over");
      },
      enter: () => {
        droppableContainer.classList.add("drag-over");
      },
      out: () => {
        droppableContainer.classList.remove("drag-over");
      },
      leave: () => {
        droppableContainer.classList.remove("drag-over");
      },
    });
  });
};


export const getDroppedObjectDetails = async ({ dataItems }) => {
  try {
    if (!dataItems || dataItems.length === 0) {
      console.error("[Object Details] No items to fetch.");
      return;
    }
    const objectId = dataItems[0]?.objectId;
    const type = dataItems[0]?.objectType;

    if (!objectId || !type) {
      throw new Error("[Object Details] Missing or invalid object ID or type");
    }

    // Use the axios instance to make the GET request
    const objectDetailsURL = `/revFloat/getDroppedObjectDetails?oid=${objectId}&type=${type}`;
    const response = await api.get(objectDetailsURL);

    // Use response.status instead of response.ok
    if (response.status === 200) {
      return {
        success: true,
        data: {
          draggedData: response.data, // Axios automatically parses JSON
        },
      };
    } else {
      throw new Error(
        `[Object Details] HTTP error! status: ${response.status}`
      );
    }
  } catch (error) {
    console.error("[Object Details] Failed to fetch data:", error);
    return { success: false, error: error.message };
  }
};

export const SecurityContext = async () => {
  let email = "";

  let securitycontextpreference = {
    name: "Credentials",
    type: "list",
    label: "Credentials",
    options: [],
    defaultValue: "",
  };
   const tenant = await getTenant();
  let urlObjWAF = tenant+'/resources/modeler/pno/person?current=true&select=collabspaces&select=preferredcredentials&select=email';
  let response = await callwebService("GET", urlObjWAF, "");

  console.log("Response for Preferences:", response);
  if (response.status) {
    if (response.output.collabspaces) {
      response.output.collabspaces.forEach((collabspace) => {
        let organization = collabspace.name.trim();
        let couples = collabspace.couples;
        couples.forEach((couple) => {
          //MSOL-Micro Motion ● Measurement Solutions ● Leader
          const SecurityContextStr =
            couple.role.name +
            "." +
            couple.organization.name +
            "." +
            organization;
          const SecurityContextLbl =
            organization.replace("MSOL-", "") +
            " ● " +
            couple.organization.title +
            " ● " +
            couple.role.nls;
          securitycontextpreference.options.push({
            value: SecurityContextStr,
            label: SecurityContextLbl,
          });
        });
      });
    }
    if (response.output.preferredcredentials) {
      const preferredCredentials = response.output.preferredcredentials;
      const defaultOption = `${preferredCredentials.role.name}.${preferredCredentials.organization.name}.${preferredCredentials.collabspace.name}`;
      securitycontextpreference.defaultValue = defaultOption;
    }
    if (response.output.email) {
      email = response.output.email;
    }
  }

  return { securitycontextpreference: securitycontextpreference, email: email };
};
