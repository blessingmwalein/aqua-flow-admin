'use client';

import * as React from 'react';
import {
  Settings,
  Globe,
  Bell,
  Shield,
  AlertTriangle,
  Server,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Separator,
} from '@/components/ui';
import { useToast } from '@/hooks';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Africa/Harare', label: 'Central Africa Time (CAT)' },
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
        {description && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const toast = useToast();

  const [timezone, setTimezone] = React.useState('UTC');
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(false);
  const [systemAlerts, setSystemAlerts] = React.useState(true);

  const apiBaseUrl =
    typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.aquaflow.app')
      : 'https://api.aquaflow.app';

  function handleSaveGeneral() {
    toast.success('Settings saved', 'General settings have been updated.');
  }

  function handleClearCache() {
    toast.success('Cache cleared', 'Application cache has been cleared successfully.');
  }

  function handleExportData() {
    toast.info('Export requested', 'Your data export is being prepared. You will be notified when it is ready.');
  }

  function handleSaveNotifications() {
    toast.success('Notifications saved', 'Your notification preferences have been updated.');
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage application configuration and preferences.
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Settings}
            title="General Settings"
            description="Basic application configuration"
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Separator />
          <SettingRow label="Application Name" description="The display name for the admin dashboard.">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5">
              AquaFlow Admin
            </span>
          </SettingRow>
          <Separator />
          <SettingRow label="Timezone" description="Used for displaying dates and times throughout the dashboard.">
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator />
          <SettingRow label="Language" description="Interface language for the admin dashboard.">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5">
              English (en-US)
            </span>
          </SettingRow>
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleSaveGeneral}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Server}
            title="API Configuration"
            description="Backend API connection details"
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Separator />
          <SettingRow label="API Base URL" description="The base URL of the AquaFlow backend API.">
            <span className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5 break-all max-w-xs text-right block">
              {apiBaseUrl}
            </span>
          </SettingRow>
          <Separator />
          <SettingRow label="API Version" description="Current API version in use.">
            <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md px-3 py-1.5">
              v1
            </span>
          </SettingRow>
          <Separator />
          <SettingRow label="Environment" description="Deployment environment.">
            <span className={[
              'text-sm font-medium rounded-md px-3 py-1.5',
              process.env.NODE_ENV === 'production'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
            ].join(' ')}>
              {process.env.NODE_ENV ?? 'development'}
            </span>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Bell}
            title="Notifications"
            description="Control how and when you receive notifications"
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Separator />
          <SettingRow
            label="Email Notifications"
            description="Receive important alerts and updates via email."
          >
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              aria-label="Email notifications"
            />
          </SettingRow>
          <Separator />
          <SettingRow
            label="Push Notifications"
            description="Receive browser push notifications for real-time events."
          >
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
              aria-label="Push notifications"
            />
          </SettingRow>
          <Separator />
          <SettingRow
            label="System Alerts"
            description="Receive alerts for system events like errors or downtime."
          >
            <Switch
              checked={systemAlerts}
              onCheckedChange={setSystemAlerts}
              aria-label="System alerts"
            />
          </SettingRow>
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleSaveNotifications}>
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Shield}
            title="Security"
            description="Authentication and session configuration"
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Separator />
          <SettingRow label="JWT Expiry" description="Access token lifetime before refresh is required.">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5">
              15 minutes
            </span>
          </SettingRow>
          <Separator />
          <SettingRow label="Refresh Token Expiry" description="Refresh token lifetime before re-login is required.">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5">
              7 days
            </span>
          </SettingRow>
          <Separator />
          <SettingRow label="Session Timeout" description="Idle session duration before automatic logout.">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5">
              30 minutes
            </span>
          </SettingRow>
          <Separator />
          <SettingRow label="Password Policy" description="Minimum security requirements for admin accounts.">
            <span className="text-sm text-gray-600 dark:text-gray-400 text-right max-w-[220px] block">
              8+ chars, uppercase, number, special character
            </span>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <SectionHeader
            icon={AlertTriangle}
            title="Danger Zone"
            description="Irreversible or destructive actions — use with caution"
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Separator className="bg-red-100 dark:bg-red-900/30" />
          <SettingRow
            label="Clear Cache"
            description="Clears all cached data including API responses and local storage."
          >
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleClearCache}
            >
              Clear Cache
            </Button>
          </SettingRow>
          <Separator className="bg-red-100 dark:bg-red-900/30" />
          <SettingRow
            label="Export Data"
            description="Download a full data export including orders, drivers, and revenue."
          >
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleExportData}
            >
              Export Data
            </Button>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
