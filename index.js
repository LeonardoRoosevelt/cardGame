const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
};

// 花色圖片
const Symbols = [
  "https://image.flaticon.com/icons/svg/105/105223.svg", // 黑桃
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Coraz%C3%B3n.svg/1200px-Coraz%C3%B3n.svg.png", // 愛心
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/SuitDiamonds.svg/37px-SuitDiamonds.svg.png", // 方塊
  "https://image.flaticon.com/icons/svg/105/105219.svg" // 梅花
];
// 介面的函式
const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    const indexNumber = Math.floor(index / 13);
    if (indexNumber === 0 || indexNumber === 3) {
      return `
        <p>${number}</p>
        <img  src="${symbol}" />
        <p>${number}</p>`;
    } else {
      return `
        <p class="red">${number}</p>
        <img  src="${symbol}" />
        <p class="red">${number}</p>`;
    }
  },

  getCardElement(index) {
    return `
      <div data-index = "${index}" class="card back">
      </div>`;
  },
  //   轉換數字為英文
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map(index => this.getCardElement(index))
      .join("");
  },

  flipCards(...cards) {
    cards.map(card => {
      //如果是背面
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      // 回傳正面
      card.classList.add("back");
      card.innerHTML = null;
      // 如果是正面
      // 回傳背面
    });
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add("paired");
    });
  },
  // 顯示分數
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },
  // 顯示嘗試的次數
  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },
  // 配對次數
  renderMatched(matched) {
    document.querySelector(".matched").innerHTML = `${matched}`;
  },

  //   錯誤的動化效果
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        event => event.target.classList.remove("wrong"),
        { once: true }
      );
    });
  },
  //   破關的動畫效果
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  }
};

// 內部控制的函式
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10));
          view.renderMatched((model.matched += 1));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.matched === 26) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 配對失敗
          if (model.score > 0) {
            view.renderScore((model.score -= 2));
            this.currentState = GAME_STATE.CardsMatchFailed;
            view.appendWrongAnimation(...model.revealedCards);
            setTimeout(this.resetCards, 1000);
          }
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
};
// 資料的函式
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0,
  matched: 0
};

// 外掛函式庫
const utility = {
  getRandomNumberArray(count) {
    // 洗牌演算法：Fisher-Yates Shuffle
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ];
    }
    return number;
  }
};

controller.generateCards();

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", event => {
    controller.dispatchCardAction(card);
  });
  const resetbtn = document.querySelector(".resetbtn");
  resetbtn.addEventListener("click", event => {
    history.go(0);
  });
});
