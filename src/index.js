// import { debounce } from 'lodash';
import Notiflix from 'notiflix';
// import PicturesService from './getPictures';
import './css/styles.css';

const axios = require('axios').default;
const BASE_URL = 'https://pixabay.com/api/';
const AUTHORIZATION_KEY = '32884302-6b7a2916d20909a9c43654aba';

const refs = {
  searchForm: document.querySelector('#search-form'),
  button: document.querySelector('#button'),
  galleryRoot: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
}

let page = 1;
let inputValue = '';
let gallery = [];

refs.searchForm.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', getPictures);


function onSubmit(e) {
  e.preventDefault();

  inputValue = e.currentTarget.elements.searchQuery.value.trim();
  console.log(inputValue);
  // Свойство elements DOM-элемента формы содержит обьект со ссылками на все её элементы у которых есть атрибут name.

  if (inputValue === '') {
    clearGallery();
    return;
  }

  getPictures();
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
		  per_page: 5,
      },
    })
    .then(response => {
      //  console.log(response);

      const pictures = response.data.hits;
      console.log(pictures);

      if (pictures.length === 0) {
        Notiflix.Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }


      clearGallery();
	

		gallery.push(...pictures);

      createGallery(gallery);
		
		page += 1;
		if(page > 1){
			refs.loadMoreBtn.style.display = "block"
		}
    })
    .catch(error => {
      console.log(error);
    });
}

function createGallery(pictures) {
  const listEl = pictures.map(picture => {
	
    return `<div class="photo-card">
		<img src="${picture.webformatURL}" alt="" loading="lazy" />
		<div class="info">
		  <p class="info-item">
			 <b>Likes:${picture.likes}</b>
		  </p>
		  <p class="info-item">
			 <b>Views:${picture.views}</b>
		  </p>
		  <p class="info-item">
			 <b>Comments:${picture.comments}</b>
		  </p>
		  <p class="info-item">
			 <b>Downloads:${picture.downloads}</b>
		  </p>
		</div>
	 </div>`;
  });
  refs.galleryRoot.insertAdjacentHTML('beforeend', listEl.join(''));
}

function clearGallery() {
  refs.galleryRoot.innerHTML = '';
}
