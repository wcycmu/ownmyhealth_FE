import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleIcon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', titleIcon }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
        <div className="p-6">
            <div className="flex items-center mb-4">
                {titleIcon}
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>
            <div className="text-slate-600">{children}</div>
        </div>
    </div>
  );
};

export default Card;