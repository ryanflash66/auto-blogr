// Supabase Status Debug Component
import React, { useEffect, useState } from "react";
import { supabaseService } from "../src/services/supabaseService.js";
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseStatus,
} from "../src/config/supabase.js";

function SupabaseDebug() {
  const [status, setStatus] = useState({});

  useEffect(() => {
    const checkStatus = () => {
      const debugInfo = {
        envVars: {
          url: import.meta.env.VITE_SUPABASE_URL ? "Set" : "Missing",
          key: import.meta.env.VITE_SUPABASE_ANON_KEY ? "Set" : "Missing",
        },
        supabaseConfig: {
          isConfigured: isSupabaseConfigured,
          clientExists: !!supabase,
          status: getSupabaseStatus(),
        },
        service: {
          configured: supabaseService.isConfigured(),
          clientExists: !!supabaseService.client,
          authenticated: supabaseService.isAuthenticated(),
        },
      };
      setStatus(debugInfo);
    };

    checkStatus();
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔍 Supabase Debug Info</h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Environment Variables:</h4>
          <ul className="ml-4 space-y-1">
            <li>
              VITE_SUPABASE_URL:{" "}
              <span
                className={
                  status.envVars?.url === "Set"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {status.envVars?.url}
              </span>
            </li>
            <li>
              VITE_SUPABASE_ANON_KEY:{" "}
              <span
                className={
                  status.envVars?.key === "Set"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {status.envVars?.key}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Supabase Config:</h4>
          <ul className="ml-4 space-y-1">
            <li>
              Is Configured:{" "}
              <span
                className={
                  status.supabaseConfig?.isConfigured
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {status.supabaseConfig?.isConfigured ? "Yes" : "No"}
              </span>
            </li>
            <li>
              Client Exists:{" "}
              <span
                className={
                  status.supabaseConfig?.clientExists
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {status.supabaseConfig?.clientExists ? "Yes" : "No"}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Supabase Service:</h4>
          <ul className="ml-4 space-y-1">
            <li>
              Service Configured:{" "}
              <span
                className={
                  status.service?.configured ? "text-green-600" : "text-red-600"
                }
              >
                {status.service?.configured ? "Yes" : "No"}
              </span>
            </li>
            <li>
              Service Client Exists:{" "}
              <span
                className={
                  status.service?.clientExists
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {status.service?.clientExists ? "Yes" : "No"}
              </span>
            </li>
            <li>
              Is Authenticated:{" "}
              <span
                className={
                  status.service?.authenticated
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {status.service?.authenticated ? "Yes" : "No"}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Detailed Status:</h4>
          <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default SupabaseDebug;
