const API_URL = "https://jsonplaceholder.typicode.com/photos";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(10)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

let state = { posts: [] };

export const loadData = async function () {
  try {
    const data = await AJAX(`${API_URL}`);
    state.posts = data;
  } catch (error) {
    throw error;
  }
};

//// UI Build

const cardsContainer = document.querySelector(".cards-container");

const createCards = async function () {
  await loadData();
  for (let i = 0; i < 19; i++) {
    const cardsMarkup = `<div class="card-item"></div>`;
    cardsContainer.insertAdjacentHTML("afterbegin", cardsMarkup);
  }
};

const BuildUI = async function () {
  await createCards();
  const data = state.posts;
  const cards = document.querySelectorAll(".cards-container > div");
  cards.forEach((el, ind) => {
    const imageMarkup = `<img class="card-image" src=${data[ind].thumbnailUrl}></img>`;
    const titleMarkup = `<h3 class="card-title">${data[ind].title}</h3>`;
    const descriptionMarkup = `<p class="card-description">${data[ind].title}</p>`;
    const buttonMarkup = `<button type="button" class="card-button">Button</button>`;
    el.insertAdjacentHTML("afterbegin", imageMarkup);
    el.insertAdjacentHTML("beforeend", titleMarkup);
    el.insertAdjacentHTML("beforeend", descriptionMarkup);
    el.insertAdjacentHTML("beforeend", buttonMarkup);
  });
};

BuildUI();
