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
    };
    this.#createApp();
  }

  selectElement(name) {
    switch (name) {
      case "main":
        return document.getElementById("root");
      case "buttons":
        return document.querySelectorAll(
          ".cards-list > .card-item > .card-button "
        );
      case "cardsList":
        return document.querySelector(".cards-list");
      case "cardsItems":
        return document.querySelectorAll(".cards-list > .card-item");
      case "cardsContent":
        return document.querySelectorAll(".card-content");
      case "counter":
        return document.querySelector(".counter");
      default:
        break;
    }
  }

  createElement(type) {
    return document.createElement(type);
  }

  async createWebTitle() {
    const websiteTitle = this.createElement("h3");
    websiteTitle.textContent = "Lorem Ipsum";
    websiteTitle.setAttribute("class", "website-title");
    this.selectElement("main").appendChild(websiteTitle);
  }

  async createCounter() {
    const counter = this.createElement("h3");
    counter.setAttribute("class", "counter");
    counter.textContent = `counter ${this.state.counter}`;
    const cards = this.selectElement("cards");
    this.selectElement("main").insertBefore(counter, cards);
  }

  async createCards() {
    const cardsList = this.createElement("div");
    cardsList.setAttribute("class", "cards-list");
    this.selectElement("main").appendChild(cardsList);
    for (let i = 0; i < 19; i++) {
      const cardItem = this.createElement("div");
      cardItem.setAttribute("class", "card-item");
      const cardsList = this.selectElement("cardsList");
      cardsList.appendChild(cardItem);
    }
  }

  async createCardsContent() {
    const data = await this.dataLoader.LoadData();
    const cards = this.selectElement("cardsItems");
    cards.forEach((el, ind) => {
      const image = this.createElement("img");
      image.setAttribute("class", "card-image");
      image.setAttribute("alt", "image");
      image.setAttribute("src", data[ind].thumbnailUrl);
      el.appendChild(image);

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

    const cardsContent = this.selectElement("cardsContent");
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

  async createSelection() {
    const buttons = this.selectElement("buttons");
    const selected = this.state.selectedItems;
    let counter = this.state.counter;
    buttons.forEach((button) => {
      let count = 0;
      button.addEventListener("click", (e) => {
        let targeted = Number(
          e.target.parentNode.querySelector(".card-button").name
        );
        selected.set(targeted, true);
        count++ % 2 === 0
          ? selected.set(targeted, true)
          : selected.set(targeted, false);
        if (!this.state.selectedItems.get(targeted)) {
          e.target.parentNode.classList.remove("colored");
          selected.delete(targeted);
          counter = selected.size;
        }
        if (!!this.state.selectedItems.get(targeted)) {
          selected.set(targeted, true);
          e.target.parentNode.classList.add("colored");
          counter = selected.size;
        }
        this.selectElement("counter").textContent = `counter ${counter}`;
      });
    });
  }

  async #createApp() {
    await this.createWebTitle();
    await this.createCounter();
    await this.createCards();
    await this.createCardsContent();
    await this.createSelection();
  }
}

const UI = new BuildApp();
