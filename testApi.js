const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/movies'; // adjust port if needed

async function testGetAllMovies() {
  try {
    const res = await axios.get(API_BASE);
    console.log('GET /api/movies');
    console.log(`Movies count: ${res.data.count}`);
    console.log('Sample movie:', JSON.stringify(res.data.data[0], null, 2));
  } catch (err) {
    console.error('Error fetching all movies:', err.message);
  }
}

async function testGetMovieByTitle(title) {
  try {
    const res = await axios.get(`${API_BASE}/title/${encodeURIComponent(title)}`);
    console.log(`GET /api/movies/title/${title}`);
    console.log('Movie details:', JSON.stringify(res.data.data, null, 2));
  } catch (err) {
    console.error(`Error fetching movie by title "${title}":`, err.response?.data || err.message);
  }
}

async function testGetMoviesByStatus(status) {
  try {
    const res = await axios.get(`${API_BASE}/status/${encodeURIComponent(status)}`);
    console.log(`GET /api/movies/status/${status}`);
    console.log(`Movies with status "${status}": ${res.data.count}`);
  } catch (err) {
    console.error(`Error fetching movies by status "${status}":`, err.message);
  }
}

async function testGetShowtimes(movieId, date) {
  try {
    const res = await axios.get(`${API_BASE}/showtimes`, { params: { movieId, date } });
    console.log(`GET /api/movies/showtimes?movieId=${movieId}&date=${date}`);
    console.log(`Showtimes count: ${res.data.count}`);
    if (res.data.count > 0) {
      console.log('Sample showtime:', JSON.stringify(res.data.data[0], null, 2));
    }
  } catch (err) {
    console.error(`Error fetching showtimes for movieId=${movieId} on ${date}:`, err.message);
  }
}

async function runTests() {
  await testGetAllMovies();
  console.log('----');

  const sampleTitle = 'Example Movie'; // replace with a known movie title from your DB
  await testGetMovieByTitle(sampleTitle);
  console.log('----');

  const sampleStatus = 'Now Showing'; // or Coming Soon, Ended
  await testGetMoviesByStatus(sampleStatus);
  console.log('----');

  const sampleMovieId = 1; // replace with valid movie_id
  const sampleDate = '2025-10-07'; // replace with valid show_date
  await testGetShowtimes(sampleMovieId, sampleDate);
  console.log('----');
}

runTests();
