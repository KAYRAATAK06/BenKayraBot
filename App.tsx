
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHAT);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Toggle Overlay could go here if needed */}
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === AppTab.CHAT ? (
          <ChatView />
        ) : (
          <ImageView />
        )}
      </main>
    </div>
  );
};

export default App;
