import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AlertCard } from './AlertCard';
import { PersonalizedAlert } from '../../types/alert';
import { Bell, ArrowRight } from 'lucide-react';

interface RecentAlertsSectionProps {
  alerts: PersonalizedAlert[];
  onViewAllHistory: () => void;
}

export const RecentAlertsSection: React.FC<RecentAlertsSectionProps> = ({
  alerts,
  onViewAllHistory,
}) => {
  const recentAlerts = alerts.slice(0, 3);

  return (
    <Card variant="elevated" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Personalized Alerts
            </h2>
            <Badge variant="danger" size="sm">
              {alerts.length} Total
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time threshold triggers dispatched based on your vulnerability profile
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onViewAllHistory}
          rightIcon={<ArrowRight className="h-3.5 w-3.5 ml-1" />}
        >
          View Full History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </Card>
  );
};
