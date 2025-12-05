import React, { useState } from 'react';
import SkillsManager from './SkillsManager';
import CategoryManager from './CategoryManager';

const tabs = [
  { key: 'skills', label: 'Skills Manager' },
  { key: 'categories', label: 'Category Manager' }
];

const AdminSettings = () => {
  const [active, setActive] = useState('skills');

  return (
    <div className="w-full bg-white">
      {/* Tabs header */}
      <div className="mb-6 flex gap-3 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              active === tab.key
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {active === 'skills' && <SkillsManager />} 
      {active === 'categories' && <CategoryManager />} 
    </div>
  );
};

export default AdminSettings;