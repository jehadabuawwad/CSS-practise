const API_URL = "https://jsonplaceholder.typicode.com/photos";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

const request = async function (url, uploadData = undefined) {
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

let state = {
  cards: [],
  counter: 0,
  selectedItems: new Map(),
};

export const loadData = async function () {
  try {
    const data = await request(`${API_URL}`);
    state.cards = data;
  } catch (error) {
    throw error;
  }
};

const main = document.getElementById("root");
const counter = document.createElement("h3");

const createWebTitle = async function () {
  const websiteTitle = document.createElement("h3");
  websiteTitle.textContent = "Lorem Ipsum";
  websiteTitle.setAttribute("class", "website-title");
  main.appendChild(websiteTitle);
};

const createCounter = async function () {
  counter.setAttribute("class", "counter");
  counter.textContent = `counter ${state.counter}`;
  const cards = document.querySelector("cards-list");
  main.insertBefore(counter, cards);
};

const createCards = async function () {
  const cardsContainer = document.createElement("h3");
  cardsContainer.setAttribute("class", "cards-list");
  main.appendChild(cardsContainer);
  for (let i = 0; i < 19; i++) {
    const cardsMarkup = `<div class="card-item"></div>`;
    cardsContainer.insertAdjacentHTML("afterbegin", cardsMarkup);
  }
};

const BuildUI = async function () {
  await createWebTitle();
  await createCounter();
  await createCards();
  await loadData();
  const data = state.cards;
  const cards = document.querySelectorAll(".cards-list > .card-item");

  cards.forEach((el, ind) => {
    const imageMarkup = `<img class="card-image" alt="image" src=${data[ind].thumbnailUrl}></img>`;
    const contentMarkup = `<div class="card-content"></div>`;
    const buttonMarkup = `<button name=${data[ind].id} type="button" class="card-button">Button</button>`;
    el.insertAdjacentHTML("beforeend", imageMarkup);
    el.insertAdjacentHTML("beforeend", contentMarkup);
    el.insertAdjacentHTML("beforeend", buttonMarkup);
  });
  const cardsContent = document.querySelectorAll(".card-content");
  cardsContent.forEach((el, ind) => {
    const titleMarkup = `<h3 class="card-title">${data[ind].title}</h3>`;
    const descriptionMarkup = `<p class="card-description">${data[ind].title}</p>`;
    el.insertAdjacentHTML("beforeend", titleMarkup);
    el.insertAdjacentHTML("beforeend", descriptionMarkup);
  });
};

await BuildUI();

const buttons = document.querySelectorAll(".card-button");
buttons.forEach((button) => {
  let count = 0;
  button.addEventListener("click", (e) => {
    let targeted = Number(
      e.target.parentNode.querySelector(".card-button").name
    );
    state.selectedItems.set(targeted, true);

    count++ % 2 === 0
      ? state.selectedItems.set(targeted, true)
      : state.selectedItems.set(targeted, false);

    if (!state.selectedItems.get(targeted)) {
      e.target.parentNode.classList.remove("colored");
      state.selectedItems.delete(targeted);
      state.counter = state.selectedItems.size;
    }
    if (!!state.selectedItems.get(targeted)) {
      state.selectedItems.set(targeted, true);
      e.target.parentNode.classList.add("colored");
      state.counter = state.selectedItems.size;
    }
    counter.textContent = `counter ${state.counter}`;
  });
});
