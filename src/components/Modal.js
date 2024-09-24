const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded shadow-lg relative w-96">
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;