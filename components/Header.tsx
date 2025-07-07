import React from 'react';
import { HeartIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-red-500 mr-3" />
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">OwnMyHealth</h1>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;