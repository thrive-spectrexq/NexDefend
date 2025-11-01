import './FeatureSection.css';

interface FeatureSectionProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}

const FeatureSection = ({ title, description, image, imageAlt, reverse }: FeatureSectionProps) => {
  return (
    <section className={`feature-section py-20 ${reverse ? 'bg-gray-800' : ''}`}>
      <div className={`container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${reverse ? 'md:grid-flow-col-dense' : ''}`}>
        <div className={reverse ? 'md:col-start-2' : ''}>
          <h2 className="text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl">{description}</p>
        </div>
        <div>
          <img src={image} alt={imageAlt} className="rounded-lg" />
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
