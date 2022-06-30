// @ts-ignore
import Coloraze from "coloraze";
interface IConfig {
  method: string;
  headers: { "Content-Type": string };
}
interface IResponseItem {
  albumId: number;
  id: string;
  thumbnailUrl: string;
  title: string;
  url: string;
}

type IResonseData = IResponseItem[];

class LoadData {
  #API_URL: string = "https://jsonplaceholder.typicode.com/photos";
  config: IConfig;
  constructor() {
    this.config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
  async #fetchWithTimeout(
    resource: string,
    body: any = undefined,
    timeout: number = 5000
  ): Promise<IResonseData> {
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
      const response = (await Promise.race([fetcher, id])) as Response;
      const data: IResonseData = await response.json();
      clearTimeout(id);
      return data;
    } catch (error) {
      throw Error("The Data Can't be fetched");
    }
  }

  async LoadData(): Promise<IResonseData> {
    const data = await this.#fetchWithTimeout(this.#API_URL);
    return data;
  }
}

interface IState {
  counter: number;
  selectedItems: Map<
    number,
    {
      state: boolean;
      color: string;
    }
  >;
  selectedColors: string[];
}

interface IElement {
  main: HTMLElement;
  header: HTMLElement;
  headerLeft: HTMLElement;
  headerRight: HTMLElement;
  unselectAllButton: HTMLElement;
  selectAllButton: HTMLElement;
  cardsList: HTMLElement;
  counter: HTMLElement;
  colorsContainer: HTMLElement;
  seeMore: HTMLElement;
}

interface IElements {
  buttons: NodeListOf<Element>;
  cardsItems: NodeListOf<Element>;
  cardsContent: NodeListOf<Element>;
}

class BuildApp {
  dataLoader: LoadData;
  state: IState;
  constructor() {
    this.dataLoader = new LoadData();
    this.state = {
      counter: 0,
      selectedItems: new Map(),
      selectedColors: [],
    };
    this.#createApp();
  }

  createRandomColor() {
    return (
      "#" +
      (
        "00000" + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
      ).slice(-6)
    );
  }

  createColorNames(
    selected: Map<
      number,
      {
        state: boolean;
        color: string;
      }
    >
  ): void {
    this.state.selectedColors = [];
    const coloraze = new Coloraze();
    const rgbToHex = function (rgb: string) {
      let hex = Number(rgb).toString(16);
      if (hex.length < 2) {
        hex = "0" + hex;
      }
      return hex;
    };

    const fullColorHex = function (r: string, g: string, b: string) {
      const red = rgbToHex(r);
      const green = rgbToHex(g);
      const blue = rgbToHex(b);
      return `#${red}${green}${blue}`;
    };
    for (let [key, value] of selected) {
      const matchColors: RegExp = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
      const match = matchColors.exec(value.color) as RegExpExecArray;
      const r = match[1];
      const g = match[2];
      const b = match[3];
      this.state.selectedColors.push(
        ` ${coloraze.name(fullColorHex(r, g, b))} `
      );
    }
  }

  selectElement(selected: keyof IElement): HTMLElement {
    const element: IElement = {
      main: document.getElementById("root") as HTMLElement,
      header: document.querySelector(".website-header") as HTMLElement,
      headerLeft: document.querySelector(".website-header-left") as HTMLElement,
      headerRight: document.querySelector(
        ".website-header-right"
      ) as HTMLElement,
      unselectAllButton: document.querySelector(
        ".unselectall-button"
      ) as HTMLElement,
      selectAllButton: document.querySelector(
        ".selectall-button"
      ) as HTMLElement,
      cardsList: document.querySelector(".cards-list") as HTMLElement,
      counter: document.querySelector(".counter") as HTMLElement,
      colorsContainer: document.querySelector(".colors-list") as HTMLElement,
      seeMore: document.querySelector(".see-more") as HTMLElement,
    };
    return element[selected];
  }

  selectElements(selected: keyof IElements): NodeListOf<Element> {
    const elements: IElements = {
      cardsItems: document.querySelectorAll(
        ".cards-list > .card-item"
      ) as NodeListOf<Element>,
      cardsContent: document.querySelectorAll(
        ".card-content"
      ) as NodeListOf<Element>,
      buttons: document.querySelectorAll(
        ".cards-list > .card-item > .card-footer> .card-button"
      ),
    };
    return elements[selected];
  }

  createHeader(): void {
    const websiteHeader = document.createElement("div");
    websiteHeader.setAttribute("class", "website-header");

    const leftHeader = document.createElement("div");
    leftHeader.setAttribute("class", "website-header-left");
    websiteHeader.appendChild(leftHeader);

    const rightHeader = document.createElement("div");
    rightHeader.setAttribute("class", "website-header-right");
    websiteHeader.appendChild(rightHeader);
    this.selectElement("main").appendChild(websiteHeader);

    websiteHeader.style.backgroundImage = `linear-gradient(
      to right,
     ${this.createRandomColor()},
     ${this.createRandomColor()}
     )`;

    const websiteTitle = document.createElement("h3");
    websiteTitle.textContent = "Lorem Ipsum";
    websiteTitle.setAttribute("class", "website-title");
    this.selectElement("headerLeft").appendChild(websiteTitle);

    const counter = document.createElement("h3");
    counter.setAttribute("class", "counter");
    this.selectElement("headerLeft").appendChild(counter);

    const colorsContainer = document.createElement("div");
    colorsContainer.setAttribute("class", "colors-container");
    this.selectElement("headerLeft").appendChild(colorsContainer);

    const colorsList = document.createElement("h3");
    colorsList.setAttribute("class", "colors-list");
    colorsList.textContent = `No Cards Selected Yet, Try to select one`;
    colorsContainer.appendChild(colorsList);

    const seeMore = document.createElement("a");
    seeMore.setAttribute("class", "see-more");
    seeMore.textContent = "See More .. ";
    seeMore.onclick = () => {
      const seeMoreButtonStyle = this.selectElement("seeMore").style;
      const colorsContainer = this.selectElement("colorsContainer");
      const selectedColors = this.state.selectedColors;
      colorsContainer.textContent = `Selected Colors : ${[...selectedColors]}`;
      seeMoreButtonStyle.display = "none";
    };
    colorsContainer.appendChild(seeMore);

    const unselectAllButton = document.createElement("button");
    unselectAllButton.setAttribute("class", "unselectall-button");
    unselectAllButton.textContent = "Unselect All";
    unselectAllButton.addEventListener("click", () => {
      this.state.counter = 0;
      this.state.selectedColors = [];
      this.state.selectedItems = new Map();
      this.selectElements("cardsItems").forEach((card: any) => {
        card.classList.remove("selected-item");
        card.classList.add("unselected-item");
        card.querySelector(".card-button").style.backgroundColor = "red";
      });
      this.selectElement("seeMore").style.display = "none";
      this.selectElement("unselectAllButton").style.display = "none";
      this.selectElement("selectAllButton").style.display = "block";
      this.selectElement(
        "counter"
      ).textContent = `Selected Counts :  ${this.state.counter}`;
      this.selectElement("colorsContainer").textContent = "No Selected Colors";
    });
    this.selectElement("headerRight").appendChild(unselectAllButton);

    const selectAllButton = document.createElement("button");
    selectAllButton.setAttribute("class", "selectall-button");

    selectAllButton.addEventListener("click", () => {
      this.selectElements("cardsItems").forEach((card: any, idx) => {
        card.classList.add("selected-item");
        card.classList.remove("unselected-item");
        card.querySelector(
          ".card-footer > .card-button"
        ).style.backgroundColor = "green";
        this.state.selectedItems.set(idx, {
          state: true,
          color: card.querySelector(".card-header").style.backgroundColor,
        });
        this.createColorNames(this.state.selectedItems);
      });
      if (this.state.selectedItems) {
        this.selectElement("unselectAllButton").style.display = "block";
        this.selectElement("selectAllButton").style.display = "none";
        this.selectElement("seeMore").style.display = "block";
        this.selectElement(
          "counter"
        ).textContent = `Selected Counts :  ${this.state.selectedItems.size}`;
        this.selectElement(
          "colorsContainer"
        ).textContent = `Selected Colors : ${[
          ...this.state.selectedColors.slice(0, 2),
        ]}`;
      }
    });
    selectAllButton.textContent = "Select All";
    this.selectElement("headerRight").appendChild(selectAllButton);
  }

  async createCards(): Promise<void> {
    const data = await this.dataLoader.LoadData();
    const cardsList = document.createElement("div");
    cardsList.setAttribute("class", "cards-list");
    this.selectElement("main").appendChild(cardsList);

    for (let i = 0; i < 20; i++) {
      const cardItem = document.createElement("div");
      cardItem.setAttribute("class", "card-item");
      cardItem.setAttribute("number", data[i].id);
      const header = document.createElement("div");
      header.setAttribute("class", "card-header");
      header.style.backgroundColor = this.createRandomColor();
      cardItem.appendChild(header);
      const content = document.createElement("div");
      content.setAttribute("class", "card-content");
      const title = document.createElement("h3");
      title.setAttribute("class", "card-title");
      title.textContent = data[i].title;
      content.appendChild(title);
      const description = document.createElement("p");
      description.setAttribute("class", "card-title");
      description.textContent = data[i].title;
      content.appendChild(description);
      cardItem.appendChild(content);
      const footer = document.createElement("div");
      footer.setAttribute("class", "card-footer");
      const button = document.createElement("button");
      button.setAttribute("type", "button");
      button.setAttribute("class", "card-button");
      button.textContent = "Select";
      footer.appendChild(button);

      button.addEventListener("click", (e: Event) => {
        const targetButton = e.target as HTMLButtonElement;
        const targetButtonStyle = targetButton.style;
        const cardFooter = targetButton.parentNode as HTMLElement;
        const cardItem = cardFooter.parentNode as HTMLElement;
        const targetedCard = Number(cardItem.getAttribute("number"));
        const cardHeader = cardItem.querySelector(
          ".card-header"
        ) as HTMLElement;
        const cardHeaderColor = cardHeader.style.backgroundColor;
        const targetState = this.state.selectedItems.get(targetedCard)?.state;

        this.state.selectedItems.set(targetedCard, {
          state: !targetState,
          color: cardHeaderColor,
        });

        const id = Number(cardItem.getAttribute("number"));

        for (let [key, value] of this.state.selectedItems) {
          if (key === id && value.state === true) {
            cardItem.classList.add("selected-item");
            cardItem.classList.remove("unselected-item");
            targetButtonStyle.backgroundColor = "green";
            this.selectElement("selectAllButton").style.display = "block";
          }

          if (key === id && value.state === false) {
            cardItem.classList.remove("selected-item");
            cardItem.classList.add("unselected-item");
            targetButtonStyle.backgroundColor = "red";
            this.state.selectedItems.delete(key);
          }
        }

        this.createColorNames(this.state.selectedItems);
        this.selectElement("selectAllButton").style.display = "block";
        this.selectElement("unselectAllButton").style.display = "block";

        if (this.state.selectedItems.size > 2) {
          this.selectElement("seeMore").style.display = "block";
          this.selectElement(
            "counter"
          ).textContent = `Selected Counts :  ${this.state.selectedItems.size}`;
          this.selectElement(
            "colorsContainer"
          ).textContent = `Selected Colors :  ${[
            ...this.state.selectedColors.slice(0, 2),
          ]}.. `;
        } else {
          this.selectElement("seeMore").style.display = "none";
          this.selectElement(
            "counter"
          ).textContent = `Selected Counts :  ${this.state.selectedItems.size}`;
          this.selectElement(
            "colorsContainer"
          ).textContent = `Selected Colors :  ${this.state.selectedColors}`;
        }
      });
      cardItem.appendChild(footer);
      this.selectElement("cardsList").appendChild(cardItem);
    }
  }

  async #createApp() {
    this.createHeader();
    await this.createCards();
  }
}

const UI = new BuildApp();
