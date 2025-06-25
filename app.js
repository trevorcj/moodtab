"use strict";

const container = document.querySelector(".container");
const clientID = "R8VlCDdgJPBny3bMZ0FRsUfk8_FgZUXXloZqpnyVVYE";
let todoData = [];

function showOfflineBanner(message) {
  const banner = document.createElement("div");
  banner.className = "offline-banner";
  banner.textContent = message;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 5000);
}

function showOnlineBanner(message) {
  const banner = document.createElement("div");
  banner.className = "online-banner";
  banner.textContent = message;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 5000);
}

const setUsername = (username) => localStorage.setItem("user", username);

const displayPrompt = function () {
  const markup = `
    <div class="name-prompt content">
      <p class="alt app-name">MOODTAB // ${"A calm new tab with lo-fi music, quotes, and aesthetic vibes".toUpperCase()}</p>
      <div class="prompt">
        <h2>Enter your first name</h2>
        <form class="name-form" action="">
          <input type="text" class="username" id="name" maxlength="8" autofocus />
          <span class="submit-btn">&#x2192;</span>
        </form>
      </div>
      <p class="alt creator">
        MADE WITH ❤️ BY <a href="https://www.linkedin.com/in/trevorcjustus" target="_blank"><line>TREVOR</line></a>
      </p>
    </div>
  `;
  container.insertAdjacentHTML("afterbegin", markup);

  const username = document.querySelector(".username");
  const submitBtn = document.querySelector(".submit-btn");

  submitBtn.addEventListener("click", function () {
    const name = username.value.trim();
    if (name) {
      setUsername(name);
      location.reload();
    }
  });

  document.querySelector(".name-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = username.value.trim();
    if (name) {
      setUsername(name);
      location.reload();
    }
  });
};

function checkForConfetti() {
  if (todoData.length > 0 && todoData.every((todo) => todo.done)) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}

const renderTodos = function () {
  const todoList = document.querySelector(".todo-items");
  todoList.innerHTML = "";

  todoData.forEach((todo, index) => {
    const todoHTML = `
      <li data-index="${index}" class="${todo.done ? "done" : ""}">
        <img src="icons/${todo.done ? "done-icon" : "undone-icon"}.svg" alt="${
      todo.done ? "done" : "not done"
    } task" />
        <p>${
          todo.text.length > 20 ? todo.text.slice(0, 21) + "..." : todo.text
        }</p>
      </li>`;
    todoList.insertAdjacentHTML("beforeend", todoHTML);
  });
};

function setupTodoHandlers() {
  const addTodo = document.querySelector(".add-btn");
  const todoInput = document.querySelector(".add-todo");
  const todoForm = document.querySelector(".todo-form");
  const todoList = document.querySelector(".todo-items");

  addTodo.addEventListener("click", () => {
    const todoText = todoInput.value.trim();
    if (!todoText) return;

    todoData.push({ text: todoText, done: false });
    localStorage.setItem("todoStored", JSON.stringify(todoData));
    renderTodos();
    todoInput.value = "";
  });

  todoList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;

    const index = li.dataset.index;
    todoData[index].done = !todoData[index].done;
    localStorage.setItem("todoStored", JSON.stringify(todoData));

    const img = li.querySelector("img");
    img.src = `icons/${todoData[index].done ? "done-icon" : "undone-icon"}.svg`;

    li.classList.toggle("done");
    checkForConfetti();
  });

  todoForm.addEventListener("submit", (e) => e.preventDefault());
}

const renderNewTab = function (quote) {
  const markup = `
    <div class="main-tab content">
      <div class="upper-section">
        <div class="greeting-section">
          <p class="greet">HELLO, ${user.slice(0, 10)}.</p>
          <div class="clock">
            <p class="time"></p>
            <img src="icons/clock-icon.svg" alt="clock icon" />
          </div>
        </div>
        <div class="spotify-section">
          <iframe
            style="border-radius: 12px"
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DWYoYGBbGKurt?utm_source=generator"
            width="700px"
            height="250px"
            frameborder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      </div>
      <div class="lower-section">
        <div class="quote-section">
          <p class="quote">${quote}</p>
        </div>
        <div class="todo-section">
          <p>WHAT’S PLANNED FOR TODAY?</p>
          <form class="todo-form" action="">
            <input type="text" class="add-todo" id="to-do" placeholder="Add here, let’s get to work!" autofocus />
            <span class="add-btn">&#x2192;</span>
          </form>
          <ul class='todo-items'></ul>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("afterbegin", markup);

  if (!navigator.onLine) {
    document.querySelector(".spotify-section").innerHTML = "";
  }

  const timeEl = document.querySelector(".time");
  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}`;
  }

  updateClock();
  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000;
  setTimeout(() => {
    updateClock();
    setInterval(updateClock, 60000);
  }, msUntilNextMinute);

  setupTodoHandlers();
  renderTodos();
};

function resetTodosDaily() {
  const today = new Date().toISOString().split("T")[0];
  const lastActive = localStorage.getItem("lastTodoDate");

  if (lastActive !== today) {
    localStorage.setItem("lastTodoDate", today);
    todoData = [];
    localStorage.setItem("todoStored", JSON.stringify(todoData));
  } else {
    const stored = localStorage.getItem("todoStored");
    if (stored) todoData = JSON.parse(stored);
  }
}

const fetchNewQuote = async function (today) {
  try {
    const res = await fetch("https://thequoteshub.com/api/");
    if (!res.ok) throw new Error("Problem getting API data");

    const data = await res.json();
    const quoteData = {
      date: today,
      quote: `${data.text} — ${data.author}`,
    };
    localStorage.setItem("dailyQuote", JSON.stringify(quoteData));
  } catch (err) {
    console.warn("Offline or API error:", err.message);
    const fallbackQuotes = [
      "Do what you can, with what you have, where you are. — Theodore Roosevelt",
      "Be yourself; everyone else is already taken. — Oscar Wilde",
      "Fall seven times, stand up eight. — Japanese Proverb",
    ];
    const fallbackQuote =
      fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    const quoteData = { date: today, quote: fallbackQuote };
    localStorage.setItem("dailyQuote", JSON.stringify(quoteData));
    showOfflineBanner(
      "You're offline or the quote service is down. Showing a fallback quote."
    );
  }
};

const user = localStorage.getItem("user");

if (!user) {
  displayPrompt();
} else {
  resetTodosDaily();

  const today = new Date().toISOString().split("T")[0];
  const savedQuote = JSON.parse(localStorage.getItem("dailyQuote"));
  if (!savedQuote || savedQuote.date !== today) {
    fetchNewQuote(today).then(() => {
      const newQuote = JSON.parse(localStorage.getItem("dailyQuote"));
      renderNewTab(newQuote.quote);
    });
  } else {
    renderNewTab(savedQuote.quote);
  }
}

window.addEventListener("offline", () => {
  showOfflineBanner("You’re offline. Some features may not work. 😔");
});
window.addEventListener("online", () => {
  showOnlineBanner("You're back online! 😊");
  location.reload();
});
