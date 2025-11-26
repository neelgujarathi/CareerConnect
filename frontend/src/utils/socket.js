import { io } from "socket.io-client";
export const socket = io("https://careerconnect-d6ke.onrender.com", {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
});
