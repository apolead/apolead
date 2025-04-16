
import React from 'react';
import { Script } from '@/data/scripts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ScriptDialogProps {
  script: Script | null;
  isOpen: boolean;
  onClose: () => void;
}

const ScriptDialog: React.FC<ScriptDialogProps> = ({ script, isOpen, onClose }) => {
  if (!script) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-700 mr-2">
                {script.type}
              </span>
              <span className="text-gray-500 text-sm">{script.company}</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {script.product} Script
          </DialogTitle>
          <DialogDescription>
            Follow this script for guidance during customer interactions
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {script.content.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-indigo-600 mb-3">
                {section.heading}
              </h3>
              <div className="space-y-3">
                {Array.isArray(section.text) && section.text[0] && typeof section.text[0] === 'string' ? (
                  section.text.map((text, i) => (
                    <p key={i} className="text-gray-800 whitespace-pre-line">
                      {text}
                    </p>
                  ))
                ) : (
                  section.text.map((item: any, i) => (
                    <div key={i} className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-700 whitespace-pre-line">{item.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScriptDialog;
