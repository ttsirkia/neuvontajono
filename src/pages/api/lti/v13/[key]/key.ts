import * as jose from "jose";
import type { NextApiRequest, NextApiResponse } from "next";
import { LTI13ConfModel } from "../../../../../models/modelClasses";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const confItem = await LTI13ConfModel.findOne({ keyId: req.query.key });

  if (!confItem) {
    return res.status(400).send("Unknown key!");
  }

  const publicJwk = await jose.exportJWK(await jose.importSPKI(confItem.myPublic, "RS256"));
  res.send({ keys: [{ ...publicJwk, alg: "RS256", kid: confItem.keyId, use: "sig" }] });
}
