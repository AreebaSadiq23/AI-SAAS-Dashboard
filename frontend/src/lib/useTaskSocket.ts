import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";

export interface TaskUpdate {
  type: string;
  task_id?: string;
  status?: string;
  progress?: number;
  active_step?: string | null;
  summary?: string;
  steps?: { id: string; name: string; agent_key: string; status: string }[];
}

/** Subscribes to the live task timeline WebSocket and invalidates queries. */
export function useTaskSocket(onUpdate?: (u: TaskUpdate) => void): boolean {
  const token = useAuth((s) => s.token);
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!token) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${window.location.host}/ws?token=${token}`;
    const socket = new WebSocket(url);

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TaskUpdate;
        if (data.type === "task_update") {
          onUpdateRef.current?.(data);
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          if (data.task_id)
            queryClient.invalidateQueries({ queryKey: ["task", data.task_id] });
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["approvals"] });
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    const ping = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.send("ping");
    }, 25000);

    return () => {
      clearInterval(ping);
      socket.close();
    };
  }, [token, queryClient]);

  return connected;
}
