// App.tsx
import ConversationListScreen from "@/features/conversationList/conversationList";
import "./assets/main.css";

function App() {
  return (
    <>
      <div className="min-h-screen h-screen w-screen w-max-screen bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex flex-col">
        <div className="flex-1 flex flex-col">
          <ConversationListScreen />
        </div>
      </div>
    </>
  );
}

export default App;
