import React from 'react';
import './TrainModelButton.css';

interface TrainModelButtonProps {
  onTrain: () => void;
}

const TrainModelButton: React.FC<TrainModelButtonProps> = ({ onTrain }) => {
  return (
    <button className="train-model-button" onClick={onTrain}>
      Train AI Model
    </button>
  );
};

export default TrainModelButton;
