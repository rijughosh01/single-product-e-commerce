const WebSocket = require("ws");

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();

    this.wss.on("connection", (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    console.log("New WebSocket connection established");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        this.handleMessage(ws, data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      this.removeClient(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.removeClient(ws);
    });
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case "auth":
        this.clients.set(ws, {
          userId: data.userId,
          role: data.role,
          connectedAt: new Date(),
        });
        console.log(`Client authenticated: ${data.userId} (${data.role})`);
        break;

      case "ping":
        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  }

  removeClient(ws) {
    const clientInfo = this.clients.get(ws);
    if (clientInfo) {
      console.log(`Client disconnected: ${clientInfo.userId}`);
      this.clients.delete(ws);
    }
  }

  // Send notification to all admin clients
  sendToAdmins(notification) {
    const adminClients = Array.from(this.clients.entries())
      .filter(([ws, clientInfo]) => clientInfo.role === "admin")
      .map(([ws]) => ws);

    const message = JSON.stringify({
      type: "notification",
      data: notification,
      timestamp: new Date().toISOString(),
    });

    adminClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(
      `Sent notification to ${adminClients.length} admin clients:`,
      notification.type
    );
  }

  // Send notification to specific user
  sendToUser(userId, notification) {
    const userClient = Array.from(this.clients.entries()).find(
      ([ws, clientInfo]) => clientInfo.userId === userId
    );

    if (userClient) {
      const [ws] = userClient;
      const message = JSON.stringify({
        type: "notification",
        data: notification,
        timestamp: new Date().toISOString(),
      });

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        console.log(`Sent notification to user ${userId}:`, notification.type);
      }
    }
  }

  // Broadcast to all connected clients
  broadcast(notification) {
    const message = JSON.stringify({
      type: "notification",
      data: notification,
      timestamp: new Date().toISOString(),
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log(`Broadcasted notification to all clients:`, notification.type);
  }

  getConnectedClients() {
    return Array.from(this.clients.values());
  }

  // Get admin clients count
  getAdminCount() {
    return Array.from(this.clients.values()).filter(
      (client) => client.role === "admin"
    ).length;
  }
}

module.exports = WebSocketServer;
