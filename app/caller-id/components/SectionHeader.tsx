import { Plus } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  count?: number;
}

export default function SectionHeader({ title, description, actionLabel, onAction, count }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
      <div>
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {count !== undefined && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <button 
        onClick={onAction}
        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
