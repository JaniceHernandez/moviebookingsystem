const Movie = require("./models/Movie");
const MovieCast = require("./models/MovieCast");
const MovieMedia = require("./models/MovieMedia");
const MovieLanguage = require("./models/MovieLanguage");

async function runTests() {
  console.log("🎬 All Movies:");
  console.log(await Movie.getAllMovies());

  console.log("\n🎬 Movie by ID (1):");
  console.log(await Movie.getMovieById(1));

  console.log("\n🎬 Now Showing Movies:");
  console.log(await Movie.getMoviesByStatus("Now Showing"));

  console.log("\n🎭 Cast for Movie 1:");
  console.log(await MovieCast.getCastByMovie(1));

  console.log("\n🖼 Media for Movie 1:");
  console.log(await MovieMedia.getMediaByMovie(1));

  console.log("\n🌍 All Languages:");
  console.log(await MovieLanguage.getAllLanguages());
}

runTests().catch(console.error);
