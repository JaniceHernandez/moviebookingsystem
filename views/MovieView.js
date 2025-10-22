class MovieView {
  static formatMovies(movies) {
    return movies.map(movie => ({
      id: movie.movieId,
      title: movie.title,
      director: movie.director,
      description: movie.description,
      releaseDate: movie.releaseDate,
      endDate: movie.endDate,
      duration: movie.duration,
      language: movie.language,
      rating: movie.rating,
      genres: movie.genres,
      poster: movie.poster,
      status: movie.status,
    }));
  }

  static formatShowtimes(showtimes) {
    return showtimes.map(showtime => ({
      showtimeId: showtime.showtimeId,
      showDate: showtime.showDate,
      showTime: showtime.showTime,
      price: showtime.price,
      seatsAvailable: showtime.seatsAvailable,
      cinema: showtime.cinema,
    }));
  }
}

module.exports = MovieView;