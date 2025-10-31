import React from 'react';
import { User, Bell, Sliders } from 'lucide-react';
import './Settings.css';

const Settings: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold tracking-tight mb-10">Settings</h1>

      <div className="space-y-12 max-w-4xl mx-auto">
        {/* Profile Settings */}
        <SettingsSection icon={<User size={24} />} title="Profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Username" id="username" defaultValue="admin" />
            <InputField label="Email" id="email" type="email" defaultValue="admin@nexdefend.com" />
          </div>
          <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            Update Profile
          </button>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection icon={<Bell size={24} />} title="Notifications">
          <ToggleField label="Email Alerts for Critical Vulnerabilities" id="email-critical" defaultChecked />
          <ToggleField label="Email Alerts for High-Severity Alerts" id="email-high" defaultChecked />
          <ToggleField label="Daily Summary Email" id="email-summary" />
        </SettingsSection>

        {/* Integration Settings */}
        <SettingsSection icon={<Sliders size={24} />} title="Integrations">
          <p className="text-gray-400 mb-6">Manage your integrations with third-party services.</p>
          <div className="flex space-x-4">
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              Connect Slack
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
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
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
      <div className="flex items-center mb-6">
        <div className="mr-4 text-blue-500 bg-gray-700 p-3 rounded-full">{icon}</div>
        <h2 className="text-2xl font-bold">{title}</h2>
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
      <label htmlFor={id} className="block text-sm font-semibold mb-2 text-gray-300">{label}</label>
      <input
        type={type}
        id={id}
        defaultValue={defaultValue}
        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    <div className="flex items-center justify-between py-4 border-b border-gray-700 last:border-b-0">
      <label htmlFor={id} className="text-gray-300">{label}</label>
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input type="checkbox" name={id} id={id} defaultChecked={defaultChecked} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
        <label htmlFor={id} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
      </div>
    </div>
  );
};

export default Settings;
