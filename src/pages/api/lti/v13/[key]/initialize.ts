import type { NextApiRequest, NextApiResponse } from "next";
import { LTI13ConfModel } from "../../../../../models/modelClasses";
import { dbConnect } from "../../../../../utils/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const token = req.query["registration_token"];
  const confURL = req.query["openid_configuration"];

  const errorTemplate = (error: string = "") => `
<html>   
  <body>
    <p>Error occurred!</p>
    <p>${error}</p>
  </body>
</html>`;

  const completedTemplate = `
<html>   
  <body>
    <p>Registration completed!</p>
    <button onClick="completed()">OK</button>
    <script>
      function completed() {
        (window.opener || window.parent).postMessage({subject:'org.imsglobal.lti.close'}, '*');
      }  
    </script>
  </body>
</html>`;

  const confItem = await LTI13ConfModel.findOne({ keyId: req.query.key, status: "pending" });

  if (!token || !confURL) {
    res.status(400).send(errorTemplate("LTI initialization is missing required information!"));
    return;
  }

  if (!confItem) {
    res.status(400).send(errorTemplate("Unknown LTI initialization request!"));
    return;
  }

  try {
    fetch(confURL.toString())
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.issuer || !data.jwks_uri || !data.authorization_endpoint || !data.claims_supported) {
          res.status(400).send(errorTemplate("LMS did not return required information!"));
          return;
        }

        const claimsSupported: string[] = data.claims_supported;
        const requiredClaims = ["sub", "iss", "name", "given_name", "family_name", "email"];
        const claimsResult = requiredClaims.every((x) => claimsSupported.indexOf(x) >= 0);
        if (!claimsResult) {
          res.status(400).send(errorTemplate("LMS does not support all required claims!"));
          return;
        }

        confItem.iss = data.issuer;
        confItem.jwks = data.jwks_uri;
        confItem.loginURL = data.authorization_endpoint;
        await confItem.save();

        const response = {
          application_type: "web",
          response_types: ["id_token"],
          grant_types: ["implict", "client_credentials"],
          initiate_login_uri: `${process.env.HOSTNAME_URL}/neuvontajono/api/lti/v13/login`,
          redirect_uris: [`${process.env.HOSTNAME_URL}/neuvontajono/api/lti/v13/callback`],
          client_name: "Neuvontajono",
          jwks_uri: `${process.env.HOSTNAME_URL}/neuvontajono/api/lti/v13/${confItem.keyId}/key`,
          token_endpoint_auth_method: "private_key_jwt",
          scope: "",
          "https://purl.imsglobal.org/spec/lti-tool-configuration": {
            domain: `${process.env.HOSTNAME_URL?.split("/")[2]}`,
            target_link_uri: `${process.env.HOSTNAME_URL}/neuvontajono/api/lti/v13/login`,
            claims: ["iss", "sub", "name", "given_name", "family_name", "email"],
            messages: [],
          },
        };

        if (!data["registration_endpoint"]) {
          res.status(400).send("LTI registration endpoint is missing!");
          return;
        }

        fetch(data["registration_endpoint"], {
          body: JSON.stringify(response),
          method: "post",
          headers: {
            Authorization: "Bearer " + token,
          },
        })
          .then((r) => r.json())
          .then(async (data) => {
            if (data.client_id) {
              confItem.clientId = data.client_id;
            }

            if (data["https://purl.imsglobal.org/spec/lti-tool-configuration"]?.deployment_id) {
              confItem.deploymentId = data["https://purl.imsglobal.org/spec/lti-tool-configuration"].deployment_id;
            }

            confItem.status = "completed";
            await confItem.save();
            return res.status(200).send(completedTemplate);
          })
          .catch(() => {
            res.status(400).send("LTI registration to LMS failed!");
          });
      })
      .catch(() => {
        res.status(400).send(errorTemplate("Communication error with LMS!"));
      });
  } catch (e) {
    res.status(400).send("Unknown error!");
  }
}

// Avoid incorrect messages about API calls without responses because of session cookie handling
export const config = {
  api: {
    externalResolver: true,
  },
};
