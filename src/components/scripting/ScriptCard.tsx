
import React from 'react';
import { Script } from '@/data/scripts';

interface ScriptCardProps {
  script: Script;
  onClick: () => void;
}

const ScriptCard: React.FC<ScriptCardProps> = ({ script, onClick }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="mb-2 text-sm font-semibold text-indigo-600">{script.type}</div>
        <h3 className="text-lg font-bold mb-1 text-gray-900">{script.product}</h3>
        <p className="text-gray-600">{script.company}</p>
      </div>
      <div className="px-6 py-3 bg-gradient-to-r from-[#4f46e5] to-[#00c2cb] text-white text-center font-medium">
        View Script
      </div>
    </div>
  );
};

export default ScriptCard;
