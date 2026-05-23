'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '@/providers/ThemeProvider';
import { Eye, EyeOff, Sun, Moon, Monitor, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Avatar,
  AvatarFallback,
  Badge,
  Separator,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { useAuth, useToast } from '@/hooks';
import { getInitials, formatDate } from '@/utils';

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required')
    .min(1, 'Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

type PasswordFormData = yup.InferType<typeof passwordSchema>;

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100">{value ?? '—'}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const { theme, setTheme } = useTheme();

  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  function onPasswordSubmit(_data: PasswordFormData) {
    // Simulate a brief delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        toast.info('Not implemented', 'Password change is not yet available. Please contact your system administrator.');
        reset();
        resolve();
      }, 600);
    });
  }

  function handleThemeChange(value: string) {
    const t = value as ThemeOption;
    setTheme(t);
    toast.success('Theme updated', `Switched to ${t} mode.`);
  }

  const initials = user ? getInitials(user.firstName, user.lastName) : '??';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin User';

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account details and preferences.
        </p>
      </div>

      {/* Profile header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {fullName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
              <Badge className="w-fit bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                {user?.role?.replace('_', ' ') ?? 'admin'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Your account details on file.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Separator />
          <div className="grid grid-cols-2 gap-5">
            <DetailRow label="First Name" value={user?.firstName} />
            <DetailRow label="Last Name" value={user?.lastName} />
            <div className="col-span-2">
              <DetailRow label="Email Address" value={user?.email} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
          <CardDescription>Role and access details.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Separator />
          <div className="grid grid-cols-2 gap-5">
            <DetailRow
              label="Role"
              value={
                <Badge className="w-fit capitalize bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400">
                  {user?.role?.replace('_', ' ') ?? '—'}
                </Badge>
              }
            />
            <DetailRow
              label="User ID"
              value={
                <span className="font-mono text-xs break-all text-gray-600 dark:text-gray-400">
                  {user?.id ?? '—'}
                </span>
              }
            />
            <DetailRow
              label="Access Level"
              value={
                user?.role === 'super_admin'
                  ? 'Full access — all features and destructive actions'
                  : 'Admin access — manage drivers, orders, revenue'
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription>Update your login credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-5" />
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4" noValidate>
            {/* Current password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  {...register('currentPassword')}
                  className={errors.currentPassword ? 'border-red-400 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                  {...register('newPassword')}
                  className={errors.newPassword ? 'border-red-400 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword ? (
                <p className="text-xs text-red-500">{errors.newPassword.message}</p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  8+ characters, uppercase, number, and special character required.
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-400 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSubmitting} size="sm">
                {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Separator />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Choose between light, dark, or system default.
              </span>
            </div>
            {mounted ? (
              <div className="flex items-center gap-2">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeChange(value)}
                    className={[
                      'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      theme === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
                    ].join(' ')}
                    aria-pressed={theme === value}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <div
                    key={value}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 dark:border-gray-700"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
