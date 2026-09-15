import { useState } from 'react';
import { Store, Bell, Database, Palette, Shield, Globe, Save } from 'lucide-react';
import PageCard from '../components/ui/PageCard';

function ToggleSwitch({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] font-bold text-surface-900">{label}</p>
        <p className="text-[12px] text-surface-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-surface-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-2' : '-translate-x-2'
          }`}
        />
      </button>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: { icon: any; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-surface-900 tracking-tight">{title}</h3>
          <p className="text-[13px] text-surface-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General & Store', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Configuration', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
      <div className="bg-white p-6 rounded-2xl border border-surface-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900 tracking-tight">System Settings</h2>
          <p className="text-[13px] text-surface-500 mt-1">Manage your supermarket configuration and AI preferences.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-1 bg-white p-3 rounded-2xl border border-surface-100 shadow-sm shrink-0 sticky top-28">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-surface-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <SettingsSection icon={Store} title="Store Information" description="Basic store details and configuration">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-surface-700">Store Name</label>
                  <input type="text" defaultValue="Supermarket AI Main Branch" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-surface-700">Store ID</label>
                  <input type="text" defaultValue="STR-8492" disabled className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-100 text-surface-500 text-sm cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-surface-700">Currency</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm transition-all">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-surface-700">Timezone</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm transition-all">
                    <option>America/New_York (EST)</option>
                    <option>America/Chicago (CST)</option>
                    <option>America/Los_Angeles (PST)</option>
                  </select>
                </div>
              </div>
            </SettingsSection>
          )}

          {activeTab === 'notifications' && (
            <SettingsSection icon={Bell} title="Notifications" description="Configure alert preferences">
              <div className="divide-y divide-surface-100">
                <ToggleSwitch label="Low stock alerts" description="Get notified when items fall below minimum stock" defaultChecked />
                <ToggleSwitch label="Order status updates" description="Receive updates on purchase order status changes" defaultChecked />
                <ToggleSwitch label="AI insight notifications" description="Get notified about new AI recommendations" defaultChecked />
                <ToggleSwitch label="Daily summary email" description="Receive a daily digest of key metrics" />
              </div>
            </SettingsSection>
          )}

          {activeTab === 'ai' && (
            <SettingsSection icon={Database} title="AI Configuration" description="Configure AI model settings and thresholds">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-surface-700">Forecast Horizon</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm transition-all">
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-surface-700">Minimum Confidence Threshold</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="50" max="99" defaultValue="75" className="flex-1 h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-primary-600" />
                    <span className="text-[13px] font-bold text-surface-900 w-10 text-right">75%</span>
                  </div>
                </div>
                <div className="pt-2">
                  <ToggleSwitch label="Auto-generate purchase orders" description="Let AI automatically create draft POs when stock is predicted to run low" />
                </div>
              </div>
            </SettingsSection>
          )}

          {activeTab === 'appearance' && (
            <SettingsSection icon={Palette} title="Appearance" description="Customize the look and feel">
              <div className="divide-y divide-surface-100">
                <ToggleSwitch label="Compact mode" description="Reduce spacing for more data density" />
                <ToggleSwitch label="Show animations" description="Enable UI transition animations" defaultChecked />
              </div>
            </SettingsSection>
          )}

          {activeTab === 'security' && (
            <SettingsSection icon={Shield} title="Security" description="Account security and access control">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-bold text-surface-900">Two-Factor Authentication</p>
                    <p className="text-[12px] text-surface-500 mt-0.5">Add extra security to your account</p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors">
                    Enable
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-bold text-surface-900">API Access</p>
                    <p className="text-[12px] text-surface-500 mt-0.5">Manage API keys for external integrations</p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold text-surface-600 border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors">
                    Manage Keys
                  </button>
                </div>
              </div>
            </SettingsSection>
          )}

          {activeTab === 'integrations' && (
            <SettingsSection icon={Globe} title="Integrations" description="Connect with external services">
              <div className="space-y-3">
                {[
                  { name: 'POS System', status: 'Connected', connected: true },
                  { name: 'Accounting Software', status: 'Not connected', connected: false },
                  { name: 'E-commerce Platform', status: 'Not connected', connected: false },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 border border-surface-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${integration.connected ? 'bg-success-500' : 'bg-surface-300'}`} />
                      <div>
                        <p className="text-[13px] font-bold text-surface-900">{integration.name}</p>
                        <p className="text-[12px] text-surface-500">{integration.status}</p>
                      </div>
                    </div>
                    <button
                      className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                        integration.connected
                          ? 'text-surface-600 border border-surface-200 hover:bg-surface-50'
                          : 'text-primary-600 border border-primary-200 hover:bg-primary-50'
                      }`}
                    >
                      {integration.connected ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}
