import { useState } from 'react';
import './FAQ.css';

const faqs = [
  {
    question: 'Open source security',
    answer: 'NexDefend is an open source, enterprise-grade security platform. It provides a comprehensive solution for threat detection, incident response, and compliance management.',
  },
  {
    question: 'Transparency and flexibility',
    answer: 'Being open source, NexDefend offers complete transparency and flexibility. You can customize it to fit your specific security needs and integrate it with your existing infrastructure.',
  },
  {
    question: 'Documentation',
    answer: 'We provide extensive documentation to help you get started with NexDefend. Our documentation covers everything from installation and configuration to advanced usage and troubleshooting.',
  },
  {
    question: 'Community',
    answer: 'Join our vibrant community of users and contributors to get help, share your knowledge, and contribute to the project. We have a forum, a mailing list, and a Slack channel.',
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <h2>Learn more about NexDefend</h2>
      {faqs.map((faq, index) => (
        <div className={`faq-item ${activeIndex === index ? 'open' : ''}`} key={index}>
          <button className="faq-question" onClick={() => toggleFAQ(index)}>
            {faq.question}
            <span className={`faq-icon`}>{activeIndex === index ? '-' : '+'}</span>
          </button>
          <div className="faq-answer">
            <p>{faq.answer}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FAQ;
