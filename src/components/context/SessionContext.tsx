// ************************************************************************************************

import { createContext } from "react";
import type { SessionInfo } from "../../server/router/api/session";

// For front-end
export const SessionContext = createContext(undefined as SessionInfo | undefined);
