import * as XLSX from "xlsx"; // For Excel export

export const loadWAFData = async () => {
  return await new Promise((resolve, reject) => {
    window.require(
      ["DS/WAFData/WAFData"],
      (module) => {
        resolve(module);
      },
      reject
    );
  });
};

export const loadInterCom = async () => {
  return await new Promise((resolve, reject) => {
    window.require(
      ["UWA/Utils/InterCom"],
      (InterCom) => {
        console.log("InterCom module loaded:", InterCom); // Log the loaded module
        resolve(InterCom);
      },
      (error) => {
        console.error("Error loading InterCom module:", error);
        reject(error);
      }
    );
  });
};

export const loadPlatformAPI = () => {
  return new Promise((resolve, reject) => {
    window.require(
      ["DS/PlatformAPI/PlatformAPI"],
      (PlatformAPI) => {
        if (PlatformAPI) {
          resolve(PlatformAPI);
        } else {
          reject(new Error("Failed to load PlatformAPI"));
        }
      },
      reject
    );
  });
};

export const callwebService = async (method, url, body, headers = {}) => {
  let returnobj = {};
  const WAFData = await loadWAFData();
   WAFData.authenticatedRequest(url, {
    method: method,
     ...(body && { data: body }),
     type: "json",
    headers: headers,
    async: false,
    onComplete: function (dataResp) {
      returnobj.status = true;
      returnobj.output = dataResp;
      console.log("kp--CallWebService--- >> ", dataResp);
    },
    onFailure: function (error, backendresponse, response_hdrs) {
      console.log("Failedddddd", error.message);
      returnobj.status = false;
      console.log(response_hdrs);
    },
  });

  return returnobj;
};
export const makeDraggable = (element, data, onDragStart, onDragEnd) => {
  window.require(["DS/DataDragAndDrop/DataDragAndDrop"], (DataDragAndDrop) => {
    if (DataDragAndDrop) {
      DataDragAndDrop.draggable(element, {
        data: JSON.stringify(data),
        start: function () {
          if (onDragStart) onDragStart();
        },
        stop: function () {
          console.log("Drag End"); // Check if this is logged
          if (onDragEnd) onDragEnd();
        },
      });
    }
  });
};



export const excludeFields = ["Dropped Revision ID"];

export const handleExportExcel = (tableData, fileName = "table-data.xlsx") => {
  const filteredData = tableData.map((row) => {
    return Object.keys(row)
      .filter((key) => !excludeFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = row[key];
        return obj;
      }, {});
  });

  console.log("Filtered Data for Excel Export:", filteredData);

  const worksheet = XLSX.utils.json_to_sheet(filteredData);

  const columnWidths = Object.keys(filteredData[0] || {}).map((key) => ({
    wch:
      Math.max(
        key.length,
        ...filteredData.map((row) =>
          row[key] ? row[key].toString().length : 0
        )
      ) || 10, // Fallback to 10 if width calculation is invalid
  }));
  worksheet["!cols"] = columnWidths;

  // Apply text wrapping to all cells in the worksheet
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
    for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: colNum })];
      if (cell) {
        cell.s = {
          alignment: { wrapText: true },
        };
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

  // Generate and download the Excel file with the specified file name
  XLSX.writeFile(workbook, fileName);
};



  /// Handle row selection and row range selection//
  export const getRowRange = (rows, idA, idB) => {
    const range = [];
    let foundStart = false;
    let foundEnd = false;
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      if (row.id === idA || row.id === idB) {
        if (foundStart) {
          foundEnd = true;
        }
        if (!foundStart) {
          foundStart = true;
        }
      }
      if (foundStart) {
        range.push(row);
      }
      if (foundEnd) {
        break;
      }
    }
    if (!foundEnd) {
      throw new Error("Could not find whole row range");
    }
    return range;
  };


  export const makeDroppable =  ( droppableContainer, handleDrop) => {
      window.require(["DS/DataDragAndDrop/DataDragAndDrop"],  (DataDragAndDrop) => {
        DataDragAndDrop.droppable(droppableContainer, {
        drop: (data) => {
          console.log("[DragAndDrop] Drop event:", data);       
          handleDrop( JSON.parse(data));
         
        }
      });
    });
  };

  export const getTenant = () => {
    return new Promise((resolve, reject) => {
      window.require(['DS/i3DXCompassServices/i3DXCompassServices'], function (i3DXCompassServices) {
       const platformId = window.location.href.split('-')[0].split('/').pop();
       i3DXCompassServices.getServiceUrl({
         serviceName: '3DSpace',
         onComplete: function (data) {
           const matchedService = data.find(service => service.platformId.toUpperCase() === platformId.toUpperCase());
           if (matchedService) {
             console.log(matchedService.url);
            resolve(matchedService.url);
           }else {
            reject()
           }
         }
       }); 
     });
   });
  };