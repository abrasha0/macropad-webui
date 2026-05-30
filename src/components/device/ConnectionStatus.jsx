import { useDevice } from "../../hooks/useDevice";

export default function ConnectionStatus() {
  const { isConnected, connect, disconnect } = useDevice();

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div
      className={`flex items-center justify-between rounded-full p-1.5 border transition-colors ${
        isConnected
          ? "bg-surface-container-lowest border-outline-variant/30"
          : "bg-surface-container-lowest border-outline-variant/20"
      }`}
    >
      <div className="flex items-center gap-2 px-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected
              ? "bg-tertiary connected-dot"
              : "bg-outline"
          }`}
        />
        <span className="font-label-md text-label-md text-on-surface">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
      <button
        onClick={handleClick}
        className={`rounded-full px-4 py-1.5 font-label-md text-label-md transition-all ${
          isConnected
            ? "bg-surface-variant text-tertiary hover:bg-surface-container-high"
            : "bg-primary-container text-on-primary-container glow-primary hover:bg-inverse-primary"
        }`}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}
