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

    // Test Showtimes + Seating Arrangement
    const testDate = '2025-12-03'; // Use a valid date from your showtimes data
    console.log(`\n=== Showtimes & Seating Test for ${testDate} ===`);

    for (const movie of allMovies) {
      const showtimes = await MovieModel.getShowtimesByMovie(movie.movieId, testDate);

      if (showtimes.length === 0) {
        console.log(`\nMovie: ${movie.title} → No showtimes on ${testDate}`);
        continue;
      }

      console.log(`\nMovie: ${movie.title}`);
      displayShowtimes(showtimes);

      // Test seating arrangement on the FIRST showtime of this movie
      const firstShowtime = showtimes[0];
      console.log(`\nFetching seating layout for Showtime ID: ${firstShowtime.showtimeId}`);
      console.log(`   Cinema: ${firstShowtime.cinema.name} | Time: ${firstShowtime.showTime}`);

      try {
        const seating = await MovieModel.getSeatingArrangement(firstShowtime.showtimeId);

        console.log(`   Total Seats: ${seating.totalSeats}`);
        console.log(`   Available: ${seating.availableSeats} | Booked: ${seating.bookedSeats}`);

        // Display sample seats (first 10 + last 5) to avoid flooding console
        const seatKeys = Object.keys(seating.layout);
        console.log('   Sample Seats:');
        seatKeys.slice(0, 10).forEach(seat => {
          const status = seating.layout[seat] === 'available' ? '✅ available' : '❌ booked';
          console.log(`     ${seat}: ${status}`);
        });
        if (seatKeys.length > 15) {
          console.log('     ...');
          seatKeys.slice(-5).forEach(seat => {
            const status = seating.layout[seat] === 'available' ? '✅ available' : '❌ booked';
            console.log(`     ${seat}: ${status}`);
          });
        }
        console.log('-'.repeat(50));
      } catch (seatError) {
        console.log(`   Failed to load seats: ${seatError.message}`);
      }
    }

    // Optional: Test media again
    console.log('\n=== Sample Media Test (First Movie Only) ===');
    if (allMovies.length > 0) {
      const firstMovie = allMovies[0];
      console.log(`Movie: ${firstMovie.title}`);
      console.log(`  Primary Poster: ${firstMovie.poster || 'None'}`);
      const media = await MovieModel.getMediaByMovie(firstMovie.movieId);
      if (media.length === 0) {
        console.log('  No additional media');
      } else {
        media.forEach(m => {
          console.log(`  [${m.mediaType}] ${m.path}`);
        });
      }
    }

  } catch (error) {
    console.error('Test Script Failed:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    });
  }
}

function displayMovies(movies) {
  if (movies.length === 0) {
    console.log('  No movies available');
    return;
  }
  movies.forEach(movie => {
    console.log(`  [${movie.movieId}] ${movie.title}`);
    console.log(`   Director: ${movie.director} | Duration: ${movie.duration} mins`);
    console.log(`   Status: ${movie.status} | Rating: ${movie.rating.code}`);
    console.log(`   Genres: ${movie.genres.join(', ') || 'None'}`);
    console.log('-'.repeat(40));
  });
}

function displayShowtimes(showtimes) {
  if (showtimes.length === 0) {
    console.log('    → No showtimes');
    return;
  }
  showtimes.forEach(s => {
    console.log(`    [${s.showtimeId}] ${s.showTime} → ${s.cinema.name} (${s.cinema.location})`);
    console.log(`       Price: ₱${s.price} | Seats left: ${s.seatsAvailable}`);
  });
}

// Run the test
console.log('Starting full data retrieval test...\n');
displayAllData().then(() => {
  console.log('\nTest completed successfully!');
});