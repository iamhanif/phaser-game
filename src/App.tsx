import bgImage from "./assets/website-bg.png";
import Game from "./Game";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Game />
    </div>
  );
}

export default App;
