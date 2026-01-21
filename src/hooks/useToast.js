// hooks/useToast.js
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";

const useToast = () => {
  const showToast = ({
    message,
    type = "default",
    position = "top-right",
    autoClose = 5000,
    hideProgressBar = false,
    closeOnClick = true,
    pauseOnHover = true,
    draggable = true,
    theme = "light",
    transition = Bounce,
    ...otherOptions
  }) => {
    const toastFunction = toast[type] || toast;

    toastFunction(message, {
      position,
      autoClose,
      hideProgressBar,
      closeOnClick,
      pauseOnHover,
      draggable,
      theme,
      transition,
      ...otherOptions,
    });
  };

  const showSuccessToast = (message, options = {}) => {
    showToast({ message, type: "success", ...options });
  };

  const showErrorToast = (message, options = {}) => {
    showToast({ message, type: "error", ...options });
  };

  const showInfoToast = (message, options = {}) => {
    showToast({ message, type: "info", ...options });
  };

  const showWarningToast = (message, options = {}) => {
    showToast({ message, type: "warn", ...options });
  };

  return { showToast, showSuccessToast, showErrorToast, showInfoToast, showWarningToast };
};

export default useToast;