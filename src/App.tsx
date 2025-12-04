// App.tsx
import MainPage from "@/pages/mainPages/mainPage";
import "./assets/main.css";

function App() {
  return (
    <>
      <div className="min-h-screen h-screen w-screen w-max-screen bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex flex-col">
        <div className="flex-1 flex flex-col">
          <MainPage />
        </div>
      </div>
    </>
  );
}

export default App;
