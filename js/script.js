import Coloraze from "coloraze";
class LoadData {
  #API_URL = "https://jsonplaceholder.typicode.com/photos";
  constructor() {
    this.config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
  async #fetchWithTimeout(resource, body = undefined, timeout = 5000) {
    try {
      const abortController = new AbortController();
      const id = setTimeout(() => abortController.abort(), timeout);
      const fetcher = body
        ? fetch(resource, {
            ...this.config,
            signal: abortController.signal,
            body,
          })
        : await fetch(resource);
      const response = await Promise.race([fetcher, id]);
      const data = await response.json();
      clearTimeout(id);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async LoadData() {
    const data = await this.#fetchWithTimeout(this.#API_URL);
    return data;
  }
}

class BuildApp {
  constructor() {
    this.dataLoader = new LoadData();
    this.state = {
      counter: 0,
      selectedItems: new Map(),
      selectedColors: [],
    };
    this.#createApp();
  }

  randomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  createColorNames(selected) {
    this.state.selectedColors = [];
    const coloraze = new Coloraze();
    const rgbToHex = function (rgb) {
      let hex = Number(rgb).toString(16);
      if (hex.length < 2) {
        hex = "0" + hex;
      }
      return hex;
    };

    const fullColorHex = function (r, g, b) {
      const red = rgbToHex(r);
      const green = rgbToHex(g);
      const blue = rgbToHex(b);
      return `#${red}${green}${blue}`;
    };

    for (let [key, value] of selected) {
      const matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
      const match = matchColors.exec(value.color);

      const r = match[1];
      const g = match[2];
      const b = match[3];

      this.state.selectedColors.push(
        ` ${coloraze.name(fullColorHex(r, g, b))} `
      );
    }
  }

  selectElement() {
    return {
      main: document.getElementById("root"),
      header: document.querySelector(".website-header"),
      buttons: document.querySelectorAll(
        ".cards-list > .card-item > .card-button"
      ),
      cardsList: document.querySelector(".cards-list"),
      cardsItems: document.querySelectorAll(".cards-list > .card-item"),
      cardsContent: document.querySelectorAll(".card-content"),
      counter: document.querySelector(".counter"),
      colorsContainer: document.querySelector(".colors-list"),
    };
  }

  createElement(type) {
    return document.createElement(type);
  }

  createWebsiteHeader() {
    const websiteHeader = this.createElement("div");
    websiteHeader.setAttribute("class", "website-header");
    this.selectElement().main.appendChild(websiteHeader);
    websiteHeader.style.backgroundImage = `linear-gradient(
      to right,
     ${this.randomColor()},
     ${this.randomColor()}
    )`;
  }

  createWebTitle() {
    const websiteTitle = this.createElement("h3");
    websiteTitle.textContent = "Lorem Ipsum";
    websiteTitle.setAttribute("class", "website-title");
    this.selectElement().header.appendChild(websiteTitle);
  }

  createCounter() {
    const counter = this.createElement("h3");
    counter.setAttribute("class", "counter");
    this.selectElement().header.appendChild(counter);
  }

  createColorsList() {
    const colorsList = this.createElement("h3");
    colorsList.setAttribute("class", "colors-list");
    colorsList.textContent = `No Cards Selected Yet, Try to select one`;
    this.selectElement().header.appendChild(colorsList);
  }

  createCards() {
    const cardsList = this.createElement("div");
    cardsList.setAttribute("class", "cards-list");
    this.selectElement().main.appendChild(cardsList);
    for (let i = 0; i < 19; i++) {
      const cardItem = this.createElement("div");
      cardItem.setAttribute("class", "card-item");
      this.selectElement().cardsList.appendChild(cardItem);
    }
  }

  async createCardsContent() {
    const data = await this.dataLoader.LoadData();
    const cards = this.selectElement().cardsItems;
    cards.forEach((el, ind) => {
      const header = this.createElement("div");
      header.setAttribute("class", "card-header");
      header.style.backgroundColor = this.randomColor();
      el.appendChild(header);

      const content = this.createElement("div");
      content.setAttribute("class", "card-content");
      el.appendChild(content);

      const button = this.createElement("button");
      button.setAttribute("type", "button");
      button.setAttribute("name", data[ind].id);
      button.setAttribute("class", "card-button");
      button.textContent = "Button";
      el.appendChild(button);
    });

    const cardsContent = this.selectElement().cardsContent;
    cardsContent.forEach((el, ind) => {
      const title = this.createElement("h3");
      title.setAttribute("class", "card-title");
      title.textContent = data[ind].title;
      el.appendChild(title);
      const description = this.createElement("p");
      description.setAttribute("class", "card-title");
      description.textContent = data[ind].title;
      el.appendChild(description);
    });
  }

  createSelection() {
    const buttons = this.selectElement().buttons;

    let selected = this.state.selectedItems;
    let cardsCounter = this.state.counter;
    let step = 0;

    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const cardHeader = e.target.parentNode.querySelector(".card-header");
        const cardHeaderStyle = e.target.parentNode.style;

        let targeted = Number(
          e.target.parentNode.querySelector(".card-button").name
        );
        let targetState = this.state.selectedItems.get(targeted)?.state;

        step++ % 2 === 0
          ? selected.set(targeted, {
              state: true,
              color: cardHeader.style.backgroundColor,
            })
          : selected.set(targeted, {
              state: !targetState,
              color: cardHeader.style.backgroundColor,
            });

        if (targetState) {
          e.target.style.backgroundColor = "red";
          cardHeaderStyle.animation = "scaleIn 1s ease-in-out";
          selected.delete(targeted);
        } else {
          e.target.style.backgroundColor = "green";
          cardHeaderStyle.animation = "scaleOut 1s ease-in-out";
          selected.set(targeted, {
            state: true,
            color: cardHeader.style.backgroundColor,
          });
        }

        cardsCounter = selected.size;
        cardHeaderStyle.animationFillMode = "both";
        this.createColorNames(selected);

        this.selectElement().counter.textContent = `Count of Selected Cards :  ${cardsCounter}`;
        this.selectElement().colorsContainer.textContent = `Selected Colors :  ${[
          this.state.selectedColors,
        ]}`;
      });
    });
  }

  async #createApp() {
    this.selectElement();
    this.createWebsiteHeader();
    this.createWebTitle();
    this.createCounter();
    this.createColorsList();
    this.createCards();
    await this.createCardsContent();
    this.createSelection();
  }
}

const UI = new BuildApp();
