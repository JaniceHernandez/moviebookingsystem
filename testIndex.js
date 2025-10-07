const Movie = require("./models/MovieModel");
const MovieCast = require("./models/MovieCast");
const MovieMedia = require("./models/MovieMedia");
const MovieLanguage = require("./models/MovieLanguage");
const MtrcbRating = require("./models/MtrcbRating");
const MovieGenre = require("./models/MovieGenre");

async function runTests() {
  console.log("🎬 All Movies:");
  console.log(await Movie.getAllMovies());

  console.log("\n🎬 Movie by title:");//for searching?
  console.log(await Movie.getMovieByTitle("The Smashing Machine"));

  console.log("\n🎬 Now Showing Movies:");
  console.log(await Movie.getMoviesByStatus("Now Showing"));

  console.log("\n🎭 Cast for Movie 1:");
  console.log(await MovieCast.getCastsByMovie(1));

  console.log("\n🌍 Select Languages:"); 
  console.log(await MovieLanguage.getLanguageByMovie(1));

  console.log("\n🖼 Media for Movie 1:");
  console.log(await MovieMedia.getMediaByMovie(1));

  console.log("\n🎬 Get Rating by ID (1):");
  console.log(await MtrcbRating.getRatingById(1));

  console.log("\n🎭 Genres for Movie 1:");
  console.log(await MovieGenre.getGenresByMovie(1));
}

runTests().catch(console.error);
