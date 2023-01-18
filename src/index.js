// import { debounce } from 'lodash';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import './css/styles.css';

const axios = require('axios').default;
const BASE_URL = 'https://pixabay.com/api/';
const AUTHORIZATION_KEY = '32884302-6b7a2916d20909a9c43654aba';

const refs = {
  searchForm: document.querySelector('#search-form'),
  button: document.querySelector('#button'),
  //   gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};
const gallery = document.querySelector('.gallery');

let page = 1;
let inputValue = '';
let galleryCollection = [];
let totalHits = 0;
let remainingHits = 0;
let takenHits = 0;

refs.searchForm.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', getPictures);


new SimpleLightbox('.gallery a', { 
	captionsData: 'alt',
	captionsDelay: 250,
	animationSpeed: 250,
});

// const { height: cardHeight } = document
//   .querySelector(".gallery")
//   .firstElementChild.getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: "smooth",
// });


function onSubmit(e) {
  e.preventDefault();

  galleryCollection = [];
  inputValue = e.currentTarget.elements.searchQuery.value.trim();
  console.log(inputValue);
  // Свойство elements DOM-элемента формы содержит обьект со ссылками на все её элементы у которых есть атрибут name.

  if (inputValue === '') {
    clearGallery();
    return;
  }

  getPictures();
  //   createTotalHitsMessage(totalHits);
  //   checkRemainingHits();
}

function getPictures() {
  axios
    .get(BASE_URL, {
      params: {
        key: AUTHORIZATION_KEY,
        q: inputValue,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    })
    .then(response => {
      console.log(response);
      totalHits = response.data.totalHits;
      console.log(totalHits);

      clearGallery();
      const pictures = response.data.hits;
      // console.log(pictures);

      if (pictures.length === 0) {
        Notiflix.Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      galleryCollection.push(...pictures);

      createGallery(galleryCollection);

      page += 1;

      if (page > 1) {
        refs.loadMoreBtn.style.display = 'block';
      }

      // gallery.refresh();

      checkRemainingHits();
    })
    .catch(error => {
      console.log(error);
    });
}

function createGallery(pictures) {
  const markup = pictures.map(picture => {
    return `
	<div class="photo-card">
	 	<a href="${picture.largeImageURL}">
	 		<img src="${picture.webformatURL}" alt="" loading="lazy" />
	 	</a>
		<div class="info">
		  <p class="info-item">
			 <b>Likes: ${picture.likes}</b>
		  </p>
		  <p class="info-item">
			 <b>Views: ${picture.views}</b>
		  </p>
		  <p class="info-item">
			 <b>Comments: ${picture.comments}</b>
		  </p>
		  <p class="info-item">
			 <b>Downloads: ${picture.downloads}</b>
		  </p>
		</div>
	 </div>`;
  });
  gallery.insertAdjacentHTML('beforeend', markup.join(''));
}

function clearGallery() {
  gallery.innerHTML = '';
}

function createTotalHitsMessage(totalHits) {
  Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
}

function checkRemainingHits() {
  takenHits += 40;
  remainingHits = totalHits - takenHits;
  console.log(remainingHits);

  if (totalHits <= 0) {
    refs.loadMoreBtn.style.display = 'none';

    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
