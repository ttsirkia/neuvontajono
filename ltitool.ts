import { LTIConfModel } from "./src/models/modelClasses";
import { dbConnect } from "./src/utils/database";

const randomstring = require("randomstring");
const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

// ************************************************************************************************

async function tool() {
  await dbConnect();
  const commands = ["delete", "list", "set", "show"];

  if (argv.ltiver !== 11) {
    console.log("Incorrect LTI version, must be 11!");
    process.exit(1);
  }

  if (argv._.length < 1 || commands.indexOf(argv._[0]) < 0) {
    console.log("Unknown command, must be: " + commands.join(", "));
    process.exit(1);
  }

  // ************************************************************************************************
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

  // ************************************************************************************************
  process.exit(0);
}

tool();
