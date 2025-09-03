"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    // Limit connection attempts to prevent infinite loops
    if (connectionAttempts > 5) {
      console.log("Max connection attempts reached, stopping reconnection");
      return;
    }

    try {
      // Connect to WebSocket server
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
      console.log("Attempting to connect to WebSocket:", wsUrl);

      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      wsRef.current = new WebSocket(wsUrl);

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (
          wsRef.current &&
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          console.log("WebSocket connection timeout");
          wsRef.current.close();
        }
      }, 5000);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected successfully");
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setConnectionAttempts(0);

        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            // Authenticate the connection
            wsRef.current.send(
              JSON.stringify({
                type: "auth",
                userId: user._id,
                role: user.role,
              })
            );
            console.log("Sent authentication message");
          }
        }, 100);

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received WebSocket message:", data.type);

          if (data.type === "notification") {
            setNotifications((prev) => [data.data, ...prev.slice(0, 9)]); // Keep last 10 notifications

            // Show toast notification for admins
            if (user.role === "admin") {
              toast(data.data.title, {
                description: data.data.message,
                duration: 5000,
                action: {
                  label: "View",
                  onClick: () => {
                    if (data.data.type === "new_order") {
                      window.location.href = "/admin/orders";
                    } else if (data.data.type === "new_user") {
                      window.location.href = "/admin/users";
                    }
                  },
                },
              });
            }
          } else if (data.type === "pong") {
            console.log("Received pong from server");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        clearTimeout(connectionTimeout);
        setIsConnected(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        if (event.code !== 1000) {
          setConnectionAttempts((prev) => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              "Attempting to reconnect... (attempt",
              connectionAttempts + 1,
              ")"
            );
            connect();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket connection error:", error);
        console.log("WebSocket readyState:", wsRef.current?.readyState);
        clearTimeout(connectionTimeout);
        setIsConnected(false);

        if (connectionAttempts === 0) {
          console.log(
            "WebSocket server might not be running. Please ensure the server is started on port 5000"
          );
          console.log("To start the server, run: cd server && npm start");
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setIsConnected(false);
    }
  }, [isAuthenticated, user, connectionAttempts]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnecting");
      wsRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setConnectionAttempts(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const connectTimeout = setTimeout(() => {
        connect();
      }, 1000);

      return () => {
        clearTimeout(connectTimeout);
        disconnect();
      };
    } else {
      disconnect();
    }
  }, [isAuthenticated, user, connect, disconnect]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: "ping" }));
            }
          }, 60000);
        }
      } else {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: "ping" }));
            }
          }, 30000);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    isConnected,
    notifications,
    clearNotifications,
    markNotificationAsRead,
    connect,
    disconnect,
    connectionAttempts,
  };
};
