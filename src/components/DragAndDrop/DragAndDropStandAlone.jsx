import React from "react";
import useDroppableArea from "../../hooks/useDroppableArea";
import "./DragAndDrop.css"; // Import styles for the component
import { Image } from "react-bootstrap";
// import usePlantDropableArea from "../../hooks/usePlantDropableArea";

const DragAndDropStandAlone = () => {
  const { isDropped } = useDroppableArea();
  return (
    <>
      <div
        className={`droppable-container mt-4 ${
          isDropped ? "dropped-active" : ""
        }`}
      >
        <Image
          style={{ width: "90px", height: "90px" }}
          src="https://thewhitechamaleon.github.io/testrapp/images/drag.png"
          alt="Data Collect"
          className="search-icon"
        />
        <span className="drag-and-drop-text">Drag and Drop</span>
        <div className="divider-container">
          <hr className="divider" />
          <span className="divider-text">or</span>
          <hr className="divider" />
        </div>
      </div>
    </>
  );
};

export default DragAndDropStandAlone;
