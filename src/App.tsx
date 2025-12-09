import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useState } from "react";

function App() {
  const [activeItem, setActiveItem] = useState<string>("Welcome");

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        <Sidebar onItemSelect={(_, label) => setActiveItem(label)} />

        {/* Main Content Area */}
        <main className="flex-1 ml-14 lg:ml-14 transition-all duration-300 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <header className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {activeItem}
              </h1>
              <p className="text-muted-foreground">
                Select an item from the sidebar to view details.
              </p>
            </header>

            <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Content Area</h2>
              <p className="text-muted-foreground">
                This is where the content for <strong>{activeItem}</strong> would be displayed.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
