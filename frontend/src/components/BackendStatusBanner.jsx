import { useEffect, useState } from "react";
import API from "../service/api";

export default function BackendStatusBanner() {
  const [down, setDown] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        // Ping a lightweight endpoint; /products is public and inexpensive
        await API.get("/products");
        if (mounted) {
          setDown(false);
          setMessage("");
        }
      } catch (err) {
        if (!mounted) return;
        // If no response, backend likely down or CORS/network issue
        if (!err.response) {
          setDown(true);
          setMessage("Backend unreachable — check if the backend server is running.");
        } else {
          setDown(true);
          setMessage(`Backend error: ${err.response.status} ${err.response.statusText}`);
        }
      }
    };

    // Initial check
    check();
    // Poll every 10 seconds while app is open
    const id = setInterval(check, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (!down) return null;

  return (
    <div style={{ background: "#ffdddd", color: "#900", padding: "8px 12px", textAlign: "center" }}>
      <strong>Connection problem:</strong> {message}
    </div>
  );
}
