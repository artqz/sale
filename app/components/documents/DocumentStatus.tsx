import { Badge } from "~/components/ui/Badge";

const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "ACTIVE": return "bg-green-100 text-green-800 border-green-200";
    case "ARCHIVED": return "bg-gray-100 text-gray-800 border-gray-200";
    case "DELETED": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "DRAFT": return "Черновик";
    case "ACTIVE": return "Активный";
    case "ARCHIVED": return "Архивный";
    case "DELETED": return "Удаленный";
    default: return status;
  }
};

interface DocumentStatusProps {
  status: string;
  className?: string;
}

export function DocumentStatus({ status, className = "" }: DocumentStatusProps) {
  return (
    <Badge className={`${getStatusColor(status)} ${className}`}>
      {getStatusText(status)}
    </Badge>
  );
}