import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { ZodError } from "zod";
import { getSession } from "../../utils/session";

export const createContext = async (opts?: trpcNext.CreateNextContextOptions) => {
  const req = opts?.req;
  const res = opts?.res;
  const [session, richSession] = req && res ? await getSession(req, res) : [undefined, undefined];
  return { req, res, session, richSession };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () =>
  trpc.router<Context>().formatError(({ shape, error }) => {
    if (
      process.env.NODE_ENV !== "production" ||
      (shape.data.code !== "FORBIDDEN" && shape.data.code !== "UNAUTHORIZED" && !(error.cause instanceof ZodError))
    ) {
      console.log("***** ERROR *****");
      console.log(new Date().toUTCString());
      console.log(error);
      console.log(shape);
      console.log("***** END *****");
    }

    if (process.env.NODE_ENV === "production") {
      return {
        ...shape,
        data: {
          code: shape.data.code,
          httpStatus: shape.data.httpStatus,
        },
        message: "",
        code: -1,
      };
    } else {
      return { ...shape };
    }
  });

