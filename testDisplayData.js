const MovieModel = require('./models/MovieModel');

// Test function to display all movie data, showtimes, and media
async function displayAllData() {
  try {
    // Fetch all movies
    console.log('Fetching all movies...\n');
    const movies = await MovieModel.getAllMovies();

    for (const movie of movies) {
      console.log('Movie Details:');
      console.log(`  ID: ${movie.movieId}`);
      console.log(`  Title: ${movie.title}`);
      console.log(`  Director: ${movie.director}`);
      console.log(`  Description: ${movie.description}`);
      console.log(`  Release Date: ${movie.releaseDate}`);
      console.log(`  End Date: ${movie.endDate}`);
      console.log(`  Duration: ${movie.duration} minutes`);
      console.log(`  Language: ${movie.language}`);
      console.log(`  Rating: ${movie.rating.code} - ${movie.rating.description}`);
      console.log(`  Genres: ${movie.genres.join(', ')}`);
      console.log(`  Poster: ${movie.poster || 'No primary poster'}`);
      console.log(`  Status: ${movie.status}`);

      // Fetch and display additional media for the movie
      console.log('\n  Additional Media:');
      const media = await MovieModel.getMediaByMovie(movie.movieId);
      if (media.length === 0) {
        console.log('    No additional media available');
      } else {
        media.forEach(m => {
          console.log(`    Media ID: ${m.mediaId}, Type: ${m.mediaType}, Path: ${m.path}`);
        });
      }

      // Fetch and display showtimes for the movie (using a sample date, e.g., today)
      console.log('\n  Showtimes (for today):');
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const showtimes = await MovieModel.getShowtimesByMovie(movie.movieId, today);
      if (showtimes.length === 0) {
        console.log('    No showtimes available for today');
      } else {
        showtimes.forEach(s => {
          console.log(`    Showtime ID: ${s.showtimeId}`);
          console.log(`    Date: ${s.showDate}`);
          console.log(`    Time: ${s.showTime}`);
          console.log(`    Price: $${s.price}`);
          console.log(`    Seats Available: ${s.seatsAvailable}`);
          console.log(`    Cinema: ${s.cinema.name} (${s.cinema.location}, ${s.cinema.screenType})`);
        });
      }
      console.log('\n' + '='.repeat(50) + '\n');
    }
  } catch (error) {
    console.error('Error displaying data:', error.message);
  }
}

// Run the test
displayAllData();