"use client";
import { useEffect, useState } from "react";

interface Log {
  id: string;
  email: string;
  problemId: string;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://localhost:3001/auth/logs");
        const data = await response.json();
        if (response.ok) {
          setLogs(data.logs);
        } else {
          setError("Failed to fetch logs");
        }
      } catch (err) {
        alert(err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Logs</h1>
      {loading && <p>Loading logs...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No logs found.</p>}
      {!loading && !error && logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Email</th>
                <th className="border p-2">Problem ID</th>
                <th className="border p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border">
                  <td className="border p-2">{log.email}</td>
                  <td className="border p-2">{log.problemId}</td>
                  <td className="border p-2">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
