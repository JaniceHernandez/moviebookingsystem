const MovieLanguage = require("./models/MovieLanguage");

async function runTests() {
  console.log("\n🌍 All Languages:");
  console.log(await MovieLanguage.getAllLanguages());
}

runTests().catch(console.error);