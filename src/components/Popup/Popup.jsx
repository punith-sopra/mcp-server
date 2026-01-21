import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import "./Popup.css";
import {
  MSG_ADDPRODUCT_NOT_ALLOWED_ERROR,
  MSG_ADDPRODUCT_RELEASED_ERROR,
  MSG_EMPTYADD_ERROR,
} from "../../utils/toastMessages";
import useToast from "../../hooks/useToast";
const Popup = ({
  data,
  columns,
  buttonText = "Add Plants",
  addedItem,
  CAName,
  state,
}) => {
  const { showWarningToast } = useToast();
  console.log("[Popup] Data Received: ", data);
  const [uniqueTableData, setUniqueTableData] = useState(data);
  const [show, setShow] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    setUniqueTableData(data);
  }, [data]);

  const handleClose = () => setShow(false);

  const handleShow = () => {
    if (CAName) {
      setShow(true);
    } else if (state === "RELEASED") {
      // alert(
      //   "Change Action is required to assign plants to Product, please assign Modify change Action and try again"
      // );
      showWarningToast(MSG_ADDPRODUCT_RELEASED_ERROR);
    } else {
      // alert(
      //   "Change Action is required to assign plants to Product, please assign change Action and try again"
      // );
      showWarningToast(MSG_ADDPRODUCT_NOT_ALLOWED_ERROR);
    }
  };

  const addPlant = () => {
    // Some Logic
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedItem = selectedRows.map(
      (item) => item.original["Available Plant"]
    );
    console.log("[selected Item]", selectedItem);
    // need to add a condition for the no of selected items
    if (selectedItem.length === 0) {
      // alert("Please select any of the Plant");
      showWarningToast(MSG_EMPTYADD_ERROR);
    } else {
      setRowSelection({}); // Reset row selection after removal
      addedItem(selectedItem);
      handleClose();
    }
  };

  // Enhance columns with selection
  const enhancedColumns = useMemo(() => {
    const selectionColumn = {
      id: "select",
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="form-check-input"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    };

    return [selectionColumn, ...columns];
  }, [columns]);

  const table = useReactTable({
    data: uniqueTableData,
    columns: enhancedColumns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <button
        type="button"
        className="btn btn-outline-primary btn-lg m-2"
        onClick={handleShow}
      >
        {buttonText}
      </button>

      {show && (
        <>
          <div className="modal d-block" tabIndex="-1">
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "500px" }}
            >
              <div className="modal-content  container">
                <div className="modal-header">
                  <h5 className="me-5 popup-title">{columns[0].header}</h5>

                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-primary me-3"
                      onClick={() =>
                        table.getToggleAllRowsSelectedHandler()({
                          target: { checked: true },
                        })
                      }
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        table.getToggleAllRowsSelectedHandler()({
                          target: { checked: false },
                        })
                      }
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="modal-body p-0">
                  {table.getRowModel().rows.length > 0 ? (
                    <div
                      className="overflow-auto"
                      style={{ maxHeight: "60vh" }}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <div
                          key={row.id}
                          className="p-3 border-bottom d-flex align-items-center"
                          style={{
                            backgroundColor: row.getIsSelected()
                              ? "#d5e8f2"
                              : "inherit",
                          }}
                        >
                          <div className="me-3">
                            {flexRender(
                              row.getVisibleCells()[0].column.columnDef.cell,
                              row.getVisibleCells()[0].getContext()
                            )}
                          </div>
                          <div>{row.original[columns[0].accessorKey]}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted p-3">No data available</p>
                  )}
                </div>
                <div
                  className="modal-footer d-flex justify-content-end"
                  style={{ backgroundColor: "#f1f1f1" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <button
                    onClick={addPlant}
                    type="button"
                    className="btn btn-primary"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default Popup;
