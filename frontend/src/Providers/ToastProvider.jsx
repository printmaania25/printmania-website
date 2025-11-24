import { createContext, useContext } from "react";
import { toast } from "react-hot-toast";  // Ensure this import

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = (type, message) => {
    const options = {
      duration: 2000,  // Auto-dismiss
      position: "top-right",
      closeButton: true,  // X button
      style: {
        background: 'white',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    };

    if (type === "success") {
      toast.success(message, options);
    } else if (type === "error") {
      toast.error(message, options);
    } else {
      toast(message, options);
    }
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);