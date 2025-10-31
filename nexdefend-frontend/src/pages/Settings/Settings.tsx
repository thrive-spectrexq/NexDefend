import React from 'react';
import { User, Bell, Sliders } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-12">
        {/* Profile Settings */}
        <SettingsSection icon={<User />} title="Profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Username" id="username" defaultValue="admin" />
            <InputField label="Email" id="email" type="email" defaultValue="admin@nexdefend.com" />
          </div>
          <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Update Profile
          </button>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection icon={<Bell />} title="Notifications">
          <ToggleField label="Email Alerts for Critical Vulnerabilities" id="email-critical" defaultChecked />
          <ToggleField label="Email Alerts for High-Severity Alerts" id="email-high" defaultChecked />
          <ToggleField label="Daily Summary Email" id="email-summary" />
        </SettingsSection>

        {/* Integration Settings */}
        <SettingsSection icon={<Sliders />} title="Integrations">
          <p className="text-gray-400">Manage your integrations with third-party services.</p>
          <div className="mt-4 flex space-x-4">
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              Connect Slack
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              Connect Jira
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ icon, title, children }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <div className="mr-3 text-blue-500">{icon}</div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  defaultValue?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, type = 'text', defaultValue }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        id={id}
        defaultValue={defaultValue}
        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

interface ToggleFieldProps {
  label: string;
  id: string;
  defaultChecked?: boolean;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, id, defaultChecked }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <label htmlFor={id} className="text-gray-300">{label}</label>
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input type="checkbox" name={id} id={id} defaultChecked={defaultChecked} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
        <label htmlFor={id} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
      </div>
    </div>
  );
};

export default Settings;
