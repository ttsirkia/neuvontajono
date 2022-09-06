// ************************************************************************************************

import { createContext } from "react";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../../pages/api/socket";

// For front-end
export const SocketContext = createContext(undefined as Socket<ServerToClientEvents, ClientToServerEvents> | undefined);
