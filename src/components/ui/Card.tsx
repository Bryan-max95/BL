'use client';

interface CardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
}

export default function Card({ title, value, description, className = '' }: CardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
    </div>
  );
}
