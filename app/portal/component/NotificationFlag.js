import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

const NotificationFlag = ({ message, subMessage, visible, setVisible }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (visible) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => Math.max(prev - 2, 0));
      }, 100);

      const timeout = setTimeout(() => setVisible(false), 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [visible, setVisible]);

  if (!visible) return null;

  return (
    <div className="fixed z-50 top-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-start gap-3 border border-gray-200 w-80">
      <CheckCircle className="text-green-500 w-6 h-6 mt-1" />
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{message}</p>
        <p className="text-sm text-gray-600">{subMessage}</p>
      </div>
      <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-gray-700">
        <X className="w-5 h-5" />
      </button>
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default NotificationFlag;
