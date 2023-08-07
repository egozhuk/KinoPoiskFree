if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
            console.log('Service Worker зарегистрирован:', registration);
        })
        .catch((error) => {
            console.error('Ошибка регистрации Service Worker:', error);
        });
}

const apiKey = localStorage.getItem("apiKey").trim();

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const lastSearchResultsButton = document.getElementById("last-search-results");
const showFavoritesButton = document.getElementById("show-favorites");
const showAccountPageButton = document.getElementById("show-account-page");
const searchResults = document.getElementById("search-results");

function showFavorites() {
    showFavoritesButton.style.backgroundColor = '#8b0000';
    lastSearchResultsButton.style.backgroundColor = '#f44336';
    showAccountPageButton.style.backgroundColor = '#f44336';
    const favorites = getFavorites();
    displaySearchResults(favorites, true);
}

function getFavorites() {
    const favoritesJSON = localStorage.getItem("favorites");
    return favoritesJSON ? JSON.parse(favoritesJSON) : [];
}

function setFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFilmInFavorites(filmId) {
    const favorites = getFavorites();
    return favorites.some(favorite => favorite.filmId === filmId);
}

function addFilmToFavorites(film) {
    const favorites = getFavorites();
    favorites.push(film);
    setFavorites(favorites);
}

function removeFilmFromFavorites(filmId) {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(favorite => favorite.filmId !== filmId);
    setFavorites(updatedFavorites);
}

function toggleFavorite(event) {
    const filmCard = event.target.closest(".film-card");
    const film = JSON.parse(filmCard.dataset.film);

    if (event.target.textContent === "Добавить в избранное") {
        addFilmToFavorites(film);
        event.target.textContent = "Удалить из избранного";
    } else {
        removeFilmFromFavorites(film.filmId);
        event.target.textContent = "Добавить в избранное";
    }
}

async function performSearch() {
    lastSearchResultsButton.style.backgroundColor = '#8b0000';
    showFavoritesButton.style.backgroundColor = '#f44336';
    showAccountPageButton.style.backgroundColor = '#f44336';
    const query = searchInput.value.trim();

    if (query.length === 0) {
        searchResults.innerHTML = "";
        return;
    }

    const response = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query)}`, {
        headers: {
            "accept": "application/json",
            "X-API-KEY": apiKey
        }
    });

    const data = await response.json();

    if (data.films.length === 0) {
        searchResults.innerHTML = "<p>Ничего не найдено</p>";
        return;
    }

    localStorage.setItem("searchQuery", query);
    localStorage.setItem("searchResults", JSON.stringify(data.films));

    displaySearchResults(data.films);
}

searchButton.addEventListener("click", performSearch);
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        performSearch();
    }
});

showFavoritesButton.addEventListener("click", showFavorites);

showAccountPageButton.addEventListener("click", (event) => {
    window.location.href = `./account.html`;
});

function displaySearchResults(films, isFavorites = false) {
    searchResults.innerHTML = films.map(film => {
        const genres = Array.isArray(film.genres) ? film.genres.map(genre => genre.genre).join(", ") : film.genres;
        const filmData = JSON.stringify(film).replace(/"/g, '&quot;');
        return `
            <div class="film-card" data-film="${filmData}">
                <img src="${film.posterUrl ? film.posterUrl : 'https://via.placeholder.com/150'}" alt="${film.nameRu || film.nameEn}">
                <div class="film-info">
                    <h2>${film.nameRu || film.nameEn}</h2>
                    <p>Длительность: ${film.filmLength}</p>
                    <p>Год выпуска: ${film.year}</p>
                    <p>Рейтинг: ${film.rating}</p>
                    <p>Жанры: ${genres}</p>
                    <p><a class="red-button" href="https://www.kinopoisk.ru/film/${film.filmId}">Страница на кинопоиске</a></p>
                    <p><a class="red-button" href="https://www.sspoisk.ru/film/${film.filmId}">Смотреть бесплатно</a></p>
                    <button data-film-id="${film.filmId}" class="favorite-button">${isFilmInFavorites(film.filmId) ? 'Удалить из избранного' : 'Добавить в избранное'}</button>
                </div>
                <p class="film-description">Краткое описание: ${film.description}</p>
            </div>
        `;
    }).join("");

    searchResults.querySelectorAll(".favorite-button").forEach(button => button.addEventListener("click", toggleFavorite));
}

function init() {
    const savedQuery = localStorage.getItem("searchQuery");
    const savedResults = localStorage.getItem("searchResults");

    lastSearchResultsButton.style.backgroundColor = '#8b0000';

    if (savedQuery && savedResults) {
        searchInput.value = savedQuery;
        const films = JSON.parse(savedResults);
        displaySearchResults(films);
    }

    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            performSearch();
        }
    });

    lastSearchResultsButton.addEventListener("click", () => {
        lastSearchResultsButton.style.backgroundColor = '#8b0000';
        showFavoritesButton.style.backgroundColor = '#f44336';
        const films = JSON.parse(localStorage.getItem("searchResults"));
        if (films) {
            displaySearchResults(films);
        }
    });

    showFavoritesButton.addEventListener("click", showFavorites);
}

window.addEventListener("DOMContentLoaded", init);