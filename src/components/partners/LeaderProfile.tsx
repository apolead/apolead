
import React from 'react';

interface LeaderProfileProps {
  name: string;
  title: string;
  imageSrc: string;
  altText: string;
  description: string[];
}

const LeaderProfile = ({ name, title, imageSrc, altText, description }: LeaderProfileProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Failed to load image for ${name}:`, imageSrc);
    console.log('Full URL attempted:', e.currentTarget.src);
    e.currentTarget.style.display = 'none';
  };

  const handleImageLoad = () => {
    console.log(`Successfully loaded image for ${name}`);
  };

  return (
    <div className="text-center">
      <div className="w-64 h-64 mx-auto mb-6 bg-gray-200 rounded-lg overflow-hidden">
        <img 
          src={imageSrc} 
          alt={altText} 
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <p className="text-lg text-primary mb-4">{title}</p>
      <div className="text-left max-w-md mx-auto">
        {description.map((paragraph, index) => (
          <p key={index} className="text-gray-600 leading-relaxed mt-4">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LeaderProfile;
