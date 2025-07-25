// src/components/TabNavigation.jsx
import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="mb-4 border-bottom">
      <ul className="nav nav-tabs" role="tablist">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active custom-tab-button active' : 'custom-tab-button'}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabNavigation;
