import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import SplitPane from "./SplitPane";

export default function LayoutShell({
  activeTab,
  onTabChange,
  topContent,
  bottomContent,
}) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="ml-64 flex flex-col h-screen">
        <TopBar activeTab={activeTab} />
        <SplitPane top={topContent} bottom={bottomContent} />
      </main>
    </div>
  );
}
