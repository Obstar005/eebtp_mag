import { CheckCircle, Clock, Truck, XCircle, Send, FileCheck } from "lucide-react";
import type { RequestStatus } from "../types/request";


export const getStatusBadge = (status: RequestStatus) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1";
    switch (status) {
      case "approuve":
        return `${baseClasses} bg-cyan-100 text-cyan-800`;
      case "emis":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "confirme":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "valide":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "livre":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "refuse":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  export const getStatusIcon = (status: RequestStatus) => {
    const iconClass = "h-3.5 w-3.5";
    switch (status) {
      case "approuve":
        return <CheckCircle className={iconClass} />;
      case "emis":
        return <Send className={iconClass} />;
      case "confirme":
        return <FileCheck className={iconClass} />;
      case "valide":
        return <CheckCircle className={iconClass} />;
      case "livre":
        return <Truck className={iconClass} />;
      case "refuse":
        return <XCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };