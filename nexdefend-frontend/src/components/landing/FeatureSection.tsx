import React from 'react';
import './FeatureSection.css';

interface FeatureSectionProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ title, description, image, imageAlt, reverse }) => {
  return (
    <section className={`feature-section ${reverse ? 'reverse' : ''}`}>
      <div className="feature-text">
        <h2>{title}</h2>
        <p>{description}</p>
        <a href="#">Learn more about {title.split(' ')[1]} ></a>
      </div>
      <div className="feature-image">
        <img src={image} alt={imageAlt} />
      </div>
    </section>
  );
};

export default FeatureSection;
