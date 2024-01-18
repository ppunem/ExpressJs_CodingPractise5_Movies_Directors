const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(
      3000,
      console.log(
        'Db connection is successful and server has started on 3000 port',
      ),
    )
  } catch (error) {
    console.log(`Error is ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//1.API to get all movies names
app.get('/movies/', async (request, response) => {
  const getAllMoviesQuery = `
      SELECT movie_name FROM movie ORDER BY movie_id
    `

  const moviesList = await db.all(getAllMoviesQuery)
  response.send(moviesList)
})

//API to add new movie
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor) VALUES ('${directorId}','${movieName}','${leadActor}')
  `
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//3.API to get a movie by id
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id='${movieId}'
  `
  const movieDetails = await db.get(getMovieQuery)
  response.send(movieDetails)
})

//4.API to update movie details based on movieId
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const updateMovieDetails = request.body
  const {directorId, movieName, leadActor} = updateMovieDetails

  const updateMovieQuery = `
    UPDATE movie SET director_id='${directorId}',movie_name='${movieName}',lead_actor='${leadActor}' 
    WHERE movie_id='${movieId}'
  `

  const updatedMovie = await db.run(updateMovieQuery)
  console.log(updatedMovie)
  response.send('Movie Details Updated')
})

//5.API to delete a movie based on movieId
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id='${movieId}'
  `
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//6.API to get directors list
app.get('/directors/', async (request, response) => {
  const directorsQuery = `
    SELECT * FROM director ORDER BY director_id
  `
  const directorsDetails = await db.all(directorsQuery)
  response.send(directorsDetails)
})

//7.API to get movies using directorId
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const moviesQuery = `
    SELECT movie_name FROM movie WHERE director_id='${directorId}'
  `
  const moviesListOfDirectors = await db.all(moviesQuery)
  response.send(moviesListOfDirectors)
})

module.exports = app
