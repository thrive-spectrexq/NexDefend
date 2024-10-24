import React from "react";

const Home: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1>Welcome to NexDefend</h1>
      <p>Your Comprehensive Next Generation Threat Detection Platform.</p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
    textAlign: "center", // Center text alignment
  } as React.CSSProperties,
};

export default Home;
