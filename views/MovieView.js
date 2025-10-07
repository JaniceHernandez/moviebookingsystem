const MovieView = {
  formatMovies(movies) {
    return movies.map(m => ({
      id: m.movieId,
      title: m.title,
      director: m.director,
      description: m.description,
      releaseDate: m.releaseDate,
      endDate: m.endDate,
      duration: m.duration,
      language: m.language,
      rating: m.rating,
      genres: m.genres,
      poster: m.poster,
      mediaGallery: m.mediaGallery,   // array of media items
      status: m.status,
    }));
  },

  formatShowtimes(showtimes) {
    return showtimes.map(s => ({
      showtimeId: s.showtimeId,
      showDate: s.showDate,
      showTime: s.showTime,
      price: s.price,
      seatsAvailable: s.seatsAvailable,
      cinema: s.cinema,
    }));
  }
};

module.exports = MovieView;
