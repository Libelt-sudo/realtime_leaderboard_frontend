interface Props {
  connected: boolean;
}

export function ConnectionStatus({ connected }: Props) {
  return (
    <div className={`connection-status ${connected ? "connected" : "disconnected"}`}>
      <span className="dot" />
      {connected ? "Live" : "Connecting..."}
    </div>
  );
}
