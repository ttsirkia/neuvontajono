import * as jose from "jose";
import { LTI13ConfModel, LTIConfModel } from "./src/models/modelClasses";
import { dbConnect } from "./src/utils/database";

import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local", override: true });
}

const randomstring = require("randomstring");
const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

// ************************************************************************************************

async function tool() {
  await dbConnect();
  const commandsLTI11 = ["delete", "list", "set", "show"];
  const commandsLTI13 = ["create", "delete", "export", "import", "initialize", "list", "set", "show"];

  if (argv.ltiver !== 11 && argv.ltiver !== 13) {
    console.log("Incorrect LTI version, must be 11 or 13!");
    process.exit(1);
  }

  if (argv._.length < 1 || (argv.ltiver === 11 && commandsLTI11.indexOf(argv._[0]) < 0)) {
    console.log("Unknown command, must be: " + commandsLTI11.join(", "));
    process.exit(1);
  }

  if (argv._.length < 1 || (argv.ltiver === 13 && commandsLTI13.indexOf(argv._[0]) < 0)) {
    console.log("Unknown command, must be: " + commandsLTI13.join(", "));
    process.exit(1);
  }

  // ************************************************************************************************
  if (argv.ltiver === 11) {
    if (argv._[0] === "set") {
      if (!argv.key) {
        console.log("Key is not defined!");
        process.exit(1);
      }
      const secret = argv.secret ?? randomstring.generate();
      const conf = await LTIConfModel.findOrCreate(
        { name: argv.key },
        { version: argv.ltiver, content: JSON.stringify({ secret }), description: argv.desc ?? "" }
      );

      if (!conf.created) {
        conf.doc.content = JSON.stringify({ secret });
        conf.doc.description = argv.desc ?? "";
        await conf.doc.save();
      }

      console.log("LTI key is set.");
      console.log("Key: " + argv.key);
      if (argv.desc) {
        console.log("Description: " + argv.desc);
      }
      console.log("Secret: " + secret);
    }

    // ************************************************************************************************
    if (argv._[0] === "list") {
      const keys = await LTIConfModel.find({ version: argv.ltiver });
      if (keys.length > 0) {
        console.log("The following LTI keys are defined:");
        keys.forEach((x) => console.log("- " + x.name + (x.description ? `(${x.description})` : "")));
      } else {
        console.log("No keys defined.");
      }
    }

    // ************************************************************************************************
    if (argv._[0] === "show") {
      if (!argv.key) {
        console.log("Key is not defined!");
        process.exit(1);
      }
      const key = await LTIConfModel.findOne({ name: argv.key, version: argv.ltiver });
      if (key) {
        console.log("Key: " + key.name);
        if (key.description) {
          console.log("Description: " + key.description);
        }
        console.log("Secret: " + JSON.parse(key.content)["secret"]);
      } else {
        console.log("Cannot find the key!");
        process.exit(1);
      }
    }

    // ************************************************************************************************
    if (argv._[0] === "delete") {
      if (!argv.key) {
        console.log("Key is not defined!");
        process.exit(1);
      }
      const key = await LTIConfModel.findOneAndDelete({ name: argv.key, version: argv.ltiver });
      if (key) {
        console.log("Key is deleted.");
      } else {
        console.log("Cannot find the key!");
        process.exit(1);
      }
    }

    process.exit(0);

    // ************************************************************************************************
  } else if (argv.ltiver === 13) {
    if (argv._[0] === "initialize") {
      if (!argv.name) {
        console.log("Name is not defined!");
        process.exit(1);
      }

      const { publicKey, privateKey } = await jose.generateKeyPair("RS256");

      const keyId = randomstring.generate();
      const conf = await LTI13ConfModel.findOrCreate(
        { name: argv.key },
        {
          myPublic: await jose.exportSPKI(publicKey),
          mySecret: await jose.exportPKCS8(privateKey),
          status: "pending",
          iss: keyId,
          keyId,
          loginURL: keyId,
          description: argv.desc ?? "",
          name: argv.name,
        }
      );

      if (conf.created) {
        console.log("New key is created.");
        console.log();
        console.log(`Use this URL in LMS:`);
        console.log(`${process.env.HOSTNAME_URL}/neuvontajono/api/lti/v13/${keyId}/initialize`);
        process.exit(0);
      } else {
        console.log("Key with this name is already created!");
        process.exit(1);
      }
    }

    // ************************************************************************************************

    if (argv._[0] === "delete") {
      if (!argv.name) {
        console.log("Key is not defined!");
        process.exit(1);
      }
      const key = await LTI13ConfModel.findOneAndDelete({ name: argv.name });
      if (key) {
        console.log("Key is deleted.");
      } else {
        console.log("Cannot find the key!");
        process.exit(1);
      }
    }

    // ************************************************************************************************

    if (argv._[0] === "list") {
      const keys = await LTI13ConfModel.find();
      if (keys.length > 0) {
        console.log("The following LTI keys are defined:");
        keys.forEach((x) => console.log("- " + x.name + (x.description ? `(${x.description})` : "")));
      } else {
        console.log("No keys defined.");
      }
    }

    // ************************************************************************************************

    if (argv._[0] === "show") {
      if (!argv.name) {
        console.log("Key is not defined!");
        process.exit(1);
      }
      const key = await LTI13ConfModel.findOne({ name: argv.name });
      if (key) {
        console.log("Key: " + key.name);
        if (key.description) {
          console.log("Description: " + key.description);
        }

        if (key.status === "pending") {
          console.log("Registration is not completed.");
          console.log();
        }
        if (key.iss) {
          console.log("ISS: " + key.iss);
        }
        if (key.loginURL) {
          console.log("Login URL: " + key.loginURL);
        }
        if (key.clientId) {
          console.log("Client id: " + key.clientId);
        }
        if (key.deploymentId) {
          console.log("Deployment id: " + key.deploymentId);
        }

        console.log();
        console.log("My public key:");
        console.log(key.myPublic);
        console.log();
        if (key.otherPublic) {
          console.log("Public key for the ISS:");
          console.log(key.otherPublic);
        }
        if (key.jwks) {
          console.log("JWKS for the ISS:");
          console.log(key.jwks);
        }
        console.log();
        console.log("My JWKS URL:");
        console.log(`${process.env.HOSTNAME_URL}/neuvontajono/api/lti/v13/${key.keyId}/key`);
      } else {
        console.log("Cannot find the key!");
        process.exit(1);
      }
    }

    // ************************************************************************************************

    if (argv._[0] === "export") {
      if (!argv.name) {
        console.log("Key is not defined!");
        process.exit(1);
      }
      if (!argv.file) {
        console.log("File is not defined!");
        process.exit(1);
      }
      const key = await LTI13ConfModel.findOne({ name: argv.name });
      if (key) {
        fs.writeFileSync(argv.file, key.myPublic);
        console.log("Public key is exported to file.");
      } else {
        console.log("Cannot find the key!");
        process.exit(1);
      }
    }

    // ************************************************************************************************

    if (argv._[0] === "import") {
      if (!argv.name) {
        console.log("Key is not defined!");
        process.exit(1);
      }
      if (!argv.file) {
        console.log("File is not defined!");
        process.exit(1);
      }
      const key = await LTI13ConfModel.findOne({ name: argv.name });
      if (key) {
        try {
          const publicKey = fs.readFileSync(argv.file, { encoding: "utf-8" });
          jose.importSPKI(publicKey, "RS256");
          key.otherPublic = publicKey;
          key.jwks = "";
          key.status = "completed";
          await key.save();
          console.log("Public key is imported.");
        } catch (e) {
          console.log("Importing the public key failed!");
          process.exit(1);
        }
      } else {
        console.log("Cannot find the key!");
        process.exit(1);
      }
    }

    // ************************************************************************************************

    if (argv._[0] === "create") {
      if (!argv.name) {
        console.log("Name is not defined!");
        process.exit(1);
      }

      if (!argv.iss) {
        console.log("ISS is not defined!");
        process.exit(1);
      }

      if (!argv.login) {
        console.log("Login URL is not defined!");
        process.exit(1);
      }

      const { publicKey, privateKey } = await jose.generateKeyPair("RS256");

      const keyId = randomstring.generate();
      const conf = await LTI13ConfModel.findOrCreate(
        { name: argv.key },
        {
          myPublic: await jose.exportSPKI(publicKey),
          mySecret: await jose.exportPKCS8(privateKey),
          status: argv.jwks ? "completed" : "pending",
          iss: argv.iss,
          keyId,
          loginURL: argv.login,
          description: argv.desc ?? "",
          jwks: argv.jwks ?? "",
          name: argv.name,
        }
      );

      if (conf.created) {
        console.log("New key is created.");
        if (!argv.jwks) {
          console.log();
          console.log("Remember to import the public key for this service.");
        }
        process.exit(0);
      } else {
        console.log("Key with this name is already created!");
        process.exit(1);
      }
    }

    // ************************************************************************************************

    if (argv._[0] === "set") {
      if (!argv.name) {
        console.log("Key is not defined!");
        process.exit(1);
      }

      const key = await LTI13ConfModel.findOne({ name: argv.name });

      if (key) {
        if (argv.jwks) {
          key.jwks = argv.jwks;
          key.status = "completed";
          key.otherPublic = "";
        }

        if (argv.iss) {
          key.iss = argv.iss;
        }

        if (argv.login) {
          key.loginURL = argv.login;
        }

        if (argv.deploymentid) {
          key.deploymentId = argv.deploymentid;
        }

        if (argv.clientid) {
          key.clientId = argv.clientid;
        }

        if (argv.desc) {
          key.description = argv.desc;
        }

        await key.save();
        console.log("Key is updated.");
      } else {
        console.log("Cannot find the key!");
        process.exit(1);
      }
    }

    // ************************************************************************************************

    process.exit(0);
  }
}

tool();
