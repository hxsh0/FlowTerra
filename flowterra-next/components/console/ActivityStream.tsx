import type { LogLine } from "@/lib/types";

export function ActivityStream({ logs }: { logs: LogLine[] }) {
  return (
    <div className="stream">
      <div className="stream-wrap">
        <div id="stream">
          {logs.map((l) => (
            <div className="log" key={l.uid}>
              <span className="log-time">{l.time}</span>
              <span className="log-body">
                <span className="log-agent">agent.{l.agent}</span>{" "}
                {l.body.map((seg, i) =>
                  seg.t === "strong" ? (
                    <b key={i}>{seg.v}</b>
                  ) : seg.t === "pos" ? (
                    <span className="pos" key={i}>
                      {seg.v}
                    </span>
                  ) : (
                    <span key={i}>{seg.v}</span>
                  )
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
