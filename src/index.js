// import { debounce } from 'lodash';
import Notiflix from 'notiflix';

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import './css/styles.css';

const axios = require('axios').default;
const BASE_URL = 'https://pixabay.com/api/';
const AUTHORIZATION_KEY = '32884302-6b7a2916d20909a9c43654aba';

const refs = {
  searchForm: document.querySelector('#search-form'),
  button: document.querySelector('#button'),
  loadMoreBtn: document.querySelector('.load-more'),
};
const gallery = document.querySelector('.gallery');


var lightbox = new SimpleLightbox('.gallery a');

let page = 1;
let inputValue = '';
let galleryCollection = [];
let takenHits = 0;

refs.searchForm.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', getPictures);


function onSubmit(e) {
  e.preventDefault();

  inputValue = e.currentTarget.elements.searchQuery.value.trim();
  console.log('inputValue:', inputValue);
  // Свойство elements DOM-элемента формы содержит обьект со ссылками на все её элементы у которых есть атрибут name.

  if (inputValue === '') {
    clearGallery();
    return;
  }
  resetPage();
  clearGallery();
  getPictures();
}

async function getPictures() {
  const apiResponse = await fetchPictures();
  const pictures = createGallery(apiResponse);
  checkHits(apiResponse);
  createGalleryMarkup(pictures);
  lightbox.refresh();
}

async function fetchPictures() {
  try {
   //  console.log('page before fetch:', page);
    const response = await axios.get(BASE_URL, {
      params: {
        key: AUTHORIZATION_KEY,
        q: inputValue,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });
	//  console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
}

function createGallery(response) {
  const pictures = response.data.hits;
  console.log(pictures);

  if (pictures.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  galleryCollection.push(...pictures);

  incrementPage();

  return pictures;
}

function incrementPage() {
  page += 1;
//   console.log('page incremented:', page);
}

function resetPage() {
  page = 1;
//   console.log('page reset:', page);
}

function createGalleryMarkup(pictures) {
 
  const markup = pictures.map(({ largeImageURL, webformatURL, likes, views, comments, downloads }) => {
    return `
	<div class="photo-card">
	 	<a href="${largeImageURL}">
	 		<img src="${webformatURL}" alt="" loading="lazy" />
	 	</a>
		<div class="info">
		  <p class="info-item">
			 <b>Likes: ${likes}</b>
		  </p>
		  <p class="info-item">
			 <b>Views: ${views}</b>
		  </p>
		  <p class="info-item">
			 <b>Comments: ${comments}</b>
		  </p>
		  <p class="info-item">
			 <b>Downloads: ${downloads}</b>
		  </p>
		</div>
	 </div>`;
  });
  gallery.insertAdjacentHTML('beforeend', markup.join(''));

  if (page > 2) {
	smothScroll();
  }
}

function clearGallery() {
  gallery.innerHTML = '';
  galleryCollection = [];
  takenHits = 0;
  hideLoadMoreBtn();
}

function checkHits(response) {
  const totHits = response.data.totalHits;
//   console.log('totalHits:', totHits);
  takenHits = galleryCollection.length;
  console.log('takenHits:', takenHits);
  const remainingHits = totHits - takenHits;
  console.log('remainingHits:', remainingHits);

  if (takenHits <= 40 && takenHits > 0) {
    Notiflix.Notify.success(`Hooray! We found ${totHits} images.`);
  }

  if (remainingHits <= 0 && takenHits > 40) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }

  if (remainingHits > 0) {
    showLoadMoreBtn();
  } else {
    hideLoadMoreBtn();
  }

  return remainingHits;
}

function showLoadMoreBtn() {
  refs.loadMoreBtn.style.display = 'block';
}

function hideLoadMoreBtn() {
  refs.loadMoreBtn.style.display = 'none';
}

function smothScroll() {
	const { height: cardHeight } = document
	.querySelector(".gallery")
	.firstElementChild.getBoundingClientRect();
 
 window.scrollBy({
	top: cardHeight * 2,
	behavior: "smooth",
 });
}

