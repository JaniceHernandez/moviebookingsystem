const MovieModel = require('./models/MovieModel');

async function displayAllData() {
  try {
    // Fetch and display all movies
    console.log('=== All Movies ===');
    const allMovies = await MovieModel.getAllMovies();
    displayMovies(allMovies);

    // Fetch and display Now Showing movies
    console.log('\n=== Now Showing ===');
    const nowShowing = await MovieModel.getMoviesByStatus('Now Showing');
    displayMovies(nowShowing);

    // Fetch and display Coming Soon movies
    console.log('\n=== Coming Soon ===');
    const comingSoon = await MovieModel.getMoviesByStatus('Coming Soon');
    displayMovies(comingSoon);

    // Fetch and display showtimes for March 10, 2025
    console.log('\n=== Showtimes for March 10, 2025 ===');
    const showDate = '2025-10-03';
    for (const movie of allMovies) {
      console.log(`\nMovie: ${movie.title}`);
      const showtimes = await MovieModel.getShowtimesByMovie(movie.movieId, showDate);
      displayShowtimes(showtimes);
    }

    // Fetch and display all media for each movie
    console.log('\n=== All Media per Movie ===');
    for (const movie of allMovies) {
      console.log(`\nMovie: ${movie.title}`);
      console.log(`  Primary Poster: ${movie.poster || 'No primary poster'}`);
      const media = await MovieModel.getMediaByMovie(movie.movieId);
      const nonPrimaryMedia = media.filter(m => !m.isPrimary);
      if (nonPrimaryMedia.length === 0) {
        console.log('  No additional media available');
      } else {
        nonPrimaryMedia.forEach(m => {
          console.log(`  Media ID: ${m.mediaId}, Type: ${m.mediaType}, Path: ${m.path}`);
        });
      }
    }
  } catch (error) {
    console.error('Error displaying data:', {
      message: error.message,
      stack: error.stack,
      sqlcode: error.sqlcode,
      sqlstate: error.sqlstate
    });
  }
}

function displayMovies(movies) {
  if (movies.length === 0) {
    console.log('  No movies available');
    return;
  }
  movies.forEach(movie => {
    console.log(`  ID: ${movie.movieId}`);
    console.log(`  Title: ${movie.title}`);
    console.log(`  Director: ${movie.director}`);
    console.log(`  Description: ${movie.description || 'No description available'}`);
    console.log(`  Release Date: ${movie.releaseDate}`);
    console.log(`  End Date: ${movie.endDate}`);
    console.log(`  Duration: ${movie.duration} minutes`);
    console.log(`  Language: ${movie.language}`);
    console.log(`  Rating: ${movie.rating.code} - ${movie.rating.description}`);
    console.log(`  Genres: ${movie.genres.join(', ') || 'No genres available'}`);
    console.log(`  Status: ${movie.status}`);
    console.log(`  Primary Poster: ${movie.poster || 'No primary poster'}`);
    console.log('-'.repeat(40));
  });
}

function displayShowtimes(showtimes) {
  if (showtimes.length === 0) {
    console.log('  No showtimes available');
    return;
  }
  showtimes.forEach(s => {
    console.log(`  Showtime ID: ${s.showtimeId}`);
    console.log(`  Date: ${s.showDate}`);
    console.log(`  Time: ${s.showTime}`);
    console.log(`  Price: $${s.price}`);
    console.log(`  Seats Available: ${s.seatsAvailable}`);
    console.log(`  Cinema: ${s.cinema.name} (${s.cinema.location}, ${s.cinema.screenType})`);
    console.log('-'.repeat(40));
  });
}

// Run the test
displayAllData();
