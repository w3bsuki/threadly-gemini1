interface ProductPlaceholderProps {
  className?: string;
}

export const ProductPlaceholder = ({ className = "w-full h-full" }: ProductPlaceholderProps) => {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${className}`}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-300"
      >
        {/* Clothing Hanger */}
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Hanger Hook */}
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* T-shirt Shape */}
        <path
          d="M25 28 L25 35 C25 37, 27 39, 29 39 L51 39 C53 39, 55 37, 55 35 L55 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* T-shirt Body */}
        <rect
          x="30"
          y="35"
          width="20"
          height="30"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* Sleeves */}
        <path
          d="M25 28 L20 32 C18 34, 18 36, 20 38 L22 40 C23 41, 25 40, 25 38 L25 35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        <path
          d="M55 28 L60 32 C62 34, 62 36, 60 38 L58 40 C57 41, 55 40, 55 38 L55 35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* Decorative Elements */}
        <circle cx="35" cy="45" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="40" cy="48" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="45" cy="45" r="1" fill="currentColor" opacity="0.3" />
      </svg>
      
      {/* Subtle text */}
      <div className="absolute bottom-4 text-xs text-gray-400 font-medium">
        Threadly
      </div>
    </div>
  );
}; 