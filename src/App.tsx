import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  return (
    <>
      <h1 className="text-red-500 text-2xl underline">Hello World</h1>
      <Button>Click me</Button>
      <Button size="xs" variant="outline">
        Extra Small
      </Button>
    </>
  );
}

export default App;
