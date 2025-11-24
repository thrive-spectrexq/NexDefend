interface EmbeddedGrafanaPanelProps {
  panelUrl: string;
}

const EmbeddedGrafanaPanel: React.FC<EmbeddedGrafanaPanelProps> = ({ panelUrl }) => {
  return (
    <iframe
      src={panelUrl}
      width="100%"
      height="100%"
      frameBorder="0"
    ></iframe>
  );
};

export default EmbeddedGrafanaPanel;
