import "./App.css";
import HomeBackground from "../public/home-bg.jpg";

function App() {
  return (
    <div className="flex items-center">
      <div className="p-8">
        <img
          src={HomeBackground}
          className="max-w-[815px] h-screen object-cover rounded-4xl"
        />
      </div>
      <div></div>
    </div>
  );
}

export default App;
