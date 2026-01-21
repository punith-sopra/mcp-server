import React, { useEffect } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toast = ({
  message,
  type = "default", // Default toast type
  position = "top-right", // Default position
  autoClose = 5000, // Default autoClose time (5 seconds)
  hideProgressBar = false,
  newestOnTop = false,
  closeOnClick = true,
  rtl = false,
  pauseOnFocusLoss = true,
  draggable = true,
  pauseOnHover = true,
  theme = "light",
  transition = Bounce,
  ...otherProps
}) => {

  const showToast = () => {
    switch (type) {
      case "success":
        toast.success(message, { ...otherProps });
        break;
      case "error":
        toast.error(message, { ...otherProps });
        break;
      case "info":
        toast.info(message, { ...otherProps });
        break;
      case "warn":
        toast.warn(message, { ...otherProps });
        break;
      default:
        toast(message, { ...otherProps });
    }
  };

  useEffect(() => {
    showToast();
  }, []);

  return (
    <ToastContainer
      position={position}
      autoClose={autoClose}
      hideProgressBar={hideProgressBar}
      newestOnTop={newestOnTop}
      closeOnClick={closeOnClick}
      rtl={rtl}
      pauseOnFocusLoss={pauseOnFocusLoss}
      draggable={draggable}
      pauseOnHover={pauseOnHover}
      theme={theme}
      transition={transition}
    />
  );
};

export default Toast;