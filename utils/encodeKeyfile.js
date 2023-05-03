const fs = require("fs");

const keyfilePath = "/media/sf_VM_Shared/journal-search-384821-81f1d6988a3f.json";
const keyfileContents = fs.readFileSync(keyfilePath, "utf-8");
const base64Keyfile = Buffer.from(keyfileContents).toString("base64");

console.log("Base64 encoded keyfile:");
console.log(base64Keyfile);