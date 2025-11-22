import Link from 'next/link';
import { ArrowLeft, Phone } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-6 rounded-xl shadow-lg mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-blue-100 mt-1">{subtitle}</p>}
          </div>
        </div>
        <Link 
          href="/" 
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
