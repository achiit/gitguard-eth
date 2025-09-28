import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, MailIcon, PencilIcon, UserPlusIcon } from "lucide-react";
import { ActivityItem } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signed':
        return (
          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <CheckIcon className="h-4 w-4 text-white" />
          </span>
        );
      case 'sent':
        return (
          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <MailIcon className="h-4 w-4 text-white" />
          </span>
        );
      case 'created':
        return (
          <span className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
            <PencilIcon className="h-4 w-4 text-white" />
          </span>
        );
      case 'clientAdded':
        return (
          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
            <UserPlusIcon className="h-4 w-4 text-white" />
          </span>
        );
      default:
        return (
          <span className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
            <PencilIcon className="h-4 w-4 text-white" />
          </span>
        );
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'signed':
        return (
          <p className="text-sm text-gray-800">
            Contract signed by <span className="font-medium">{activity.entity?.name}</span>
          </p>
        );
      case 'sent':
        return (
          <p className="text-sm text-gray-800">
            Contract sent to <span className="font-medium">{activity.entity?.name}</span>
          </p>
        );
      case 'created':
        return (
          <p className="text-sm text-gray-800">
            Contract <span className="font-medium">{activity.title}</span> created
          </p>
        );
      case 'clientAdded':
        return (
          <p className="text-sm text-gray-800">
            New client <span className="font-medium">{activity.entity?.name}</span> added
          </p>
        );
      default:
        return <p className="text-sm text-gray-800">{activity.title}</p>;
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, idx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {/* Show connecting line for all but the last item */}
                  {idx < activities.length - 1 && (
                    <span 
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                      aria-hidden="true"
                    />
                  )}
                  
                  <div className="relative flex space-x-3">
                    <div>{getActivityIcon(activity.type)}</div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>{getActivityText(activity)}</div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
