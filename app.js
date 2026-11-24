const plants = {
  sunflower: { name: "Sunny", emoji: "🌻", mark: "SUN", light: [65, 90], water: [35, 65], clue: "☀ Bright · 💧 Damp", lightText: "Bright light", waterText: "Damp soil", badge: "Sunflower Helper" },
  fern: { name: "Fernie", emoji: "🌿", mark: "FERN", light: [25, 55], water: [55, 80], clue: "⛅ Soft · 💧 Moist", lightText: "Soft light", waterText: "Moist soil", badge: "Fern Friend" },
  cactus: { name: "Pico", emoji: "🌵", mark: "PICO", light: [70, 100], water: [10, 35], clue: "☀ Sunny · 💧 Dry", lightText: "Sunny spot", waterText: "Dry soil", badge: "Cactus Caretaker" }
};

const weathers = {
  sunny: { name: "Sunny", emoji: "☀", className: "sunny" },
  rainy: { name: "Rainy", emoji: "🌧", className: "rainy" },
  cloudy: { name: "Cloudy", emoji: "☁", className: "cloudy" }
};

const stages = [
  { name: "Seed", emoji: "🌰" },
  { name: "Seedling", emoji: "🌱" },
  { name: "Grown", emoji: "✨" }
];

const state = {
  plant: "sunflower", day: 1, light: 45, water: 50, music: "silence",
  health: 80, stage: 0, mood: "curious", evaluated: false, failed: false,
  complete: false, actions: { sun: false, water: false, music: false }, weatherPlan: ["cloudy", "sunny", "rainy", "cloudy", "sunny", "rainy"],
  dayStart: { light: 45, water: 50, health: 80 }
};
const $ = (selector) => document.querySelector(selector);
const app = $("#app");
const sunDownButton = $("#sunDownButton");
const sunUpButton = $("#sunUpButton");
const waterButton = $("#waterButton");
const waterDownButton = $("#waterDownButton");
const nextDayButton = $("#nextDayButton");
const resetButton = $("#resetButton");
const learningCard = $("#learningCard");
const retryButton = $("#retryButton");
const reportCard = $("#reportCard");
const growAgainButton = $("#growAgainButton");
let dayTimer;

function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, value)); }
function inRange(value, range) { return value >= range[0] && value <= range[1]; }

function createWeatherPlan() {
  const plan = ["sunny", "sunny", "rainy", "rainy", "cloudy", "cloudy"];
  for (let i = plan.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  return plan;
}

function applyWeather(day) {
  const plant = plants[state.plant];
  const weather = state.weatherPlan[day - 1];
  if (weather === "sunny") {
    state.light = clamp(plant.light[1] + 10);
    state.water = clamp(plant.water[0] - 15);
  } else if (weather === "rainy") {
    state.light = clamp(plant.light[0] - 15);
    state.water = clamp(plant.water[1] + 10);
  } else {
    state.light = clamp(plant.light[0] - 20);
    state.water = clamp(plant.water[0] - 10);
  }
}

function missionForDay() {
  const musicDay = state.day % 2 === 0;
  return {
    title: musicDay ? "☀ + 💧 + ♪ Care day" : "☀ + 💧 Care day",
    hint: musicDay ? "Adjust both, then choose music" : "Adjust light and water",
    needs: musicDay ? ["sun", "water", "music"] : ["sun", "water"]
  };
}

function missionReady() {
  return missionForDay().needs.every((action) => state.actions[action]);
}

function moodFromInputs() {
  const plant = plants[state.plant];
  if (state.complete) return "celebrating";
  if (state.water > plant.water[1] + 15) return "overwhelmed";
  if (state.water < plant.water[0] - 15) return "thirsty";
  if (state.light < plant.light[0] - 15) return "sleepy";
  if (state.light > plant.light[1] + 10) return "sunburned";
  if (inRange(state.light, plant.light) && inRange(state.water, plant.water)) return state.music === "upbeat" ? "dancing" : "happy";
  return "curious";
}

function messageForMood(mood) {
  return {
    curious: "What do I need today?",
    sleepy: "Too dark… I’m sleepy.",
    thirsty: "I’m thirsty!",
    overwhelmed: "My roots are soggy!",
    sunburned: "Ouch—too bright!",
    happy: "Perfect! I can grow.",
    dancing: "Healthy—and dancing!",
    celebrating: "We did it—I’m grown!"
  }[mood];
}

function careMessage() {
  const plant = plants[state.plant];
  const needsLight = state.light < plant.light[0];
  const needsWater = state.water < plant.water[0];
  if (state.complete) return "We did it—I’m grown!";
  if (needsLight && needsWater) return "I’m hungry and thirsty!";
  if (needsLight) return "I’m hungry!";
  if (needsWater) return "I’m thirsty!";
  if (state.day % 2 === 0 && state.music === "silence") return "Can I hear some music?";
  if (state.light > plant.light[1] || state.water > plant.water[1]) return "That’s a little too much.";
  return "I feel cared for!";
}

function failDay(title, explanation, mood, penalty) {
  state.failed = true;
  state.health = clamp(state.health - penalty);
  state.mood = mood;
  $("#resultTitle").textContent = title;
  $("#resultExplanation").textContent = explanation;
}

function prepareNextDay() {
  const plant = plants[state.plant];
  state.day += 1;
  state.evaluated = false;
  state.failed = false;
  state.actions = { sun: false, water: false, music: false };
  state.music = "silence";
  document.querySelector('input[name="music"][value="silence"]').checked = true;
  learningCard.hidden = true;
  applyWeather(state.day);
  state.dayStart = { light: state.light, water: state.water, health: state.health };
  render();
}

function evaluateDay() {
  if (!missionReady() || state.evaluated || state.complete) return;
  window.clearTimeout(dayTimer);
  const plant = plants[state.plant];
  const lightGood = inRange(state.light, plant.light);
  const waterGood = inRange(state.water, plant.water);
  const musicGood = state.day % 2 !== 0 || state.music !== "silence";
  const success = lightGood && waterGood && musicGood;

  if (success) {
    state.failed = false;
    state.health = clamp(state.health + 10);
    state.mood = state.music === "upbeat" ? "dancing" : "happy";
    if (state.day === 2) state.stage = 1;
    if (state.day === 4) state.stage = 2;
    const title = state.day === 2 ? "A seedling appears!" : state.day === 4 ? "Strong leaves!" : state.day === 6 ? "Six days complete!" : "Good care today!";
    $("#resultTitle").textContent = title;
    $("#resultExplanation").textContent = state.day % 2 === 0 ? "Sunlight makes food; water carries nutrients; music made today special." : "Sunlight helps leaves make food; water carries nutrients.";
    if (state.day === 6) {
      state.complete = true;
      state.mood = "celebrating";
    }
  } else if (!waterGood && state.water > plant.water[1]) {
    failDay("Too much water", "Roots also need air—not soggy soil.", "overwhelmed", 7);
  } else if (!waterGood) {
    failDay("Still too dry", "Add enough water for the roots.", "thirsty", 6);
  } else if (state.light < plant.light[0]) {
    failDay("Not enough light", "Leaves need light to make food.", "sleepy", 6);
  } else if (state.light > plant.light[1]) {
    failDay("Light is too strong", "Too much light can stress leaves.", "sunburned", 7);
  } else {
    failDay("Music day!", "Choose calm or upbeat music for me.", "curious", 3);
  }

  state.evaluated = true;
  learningCard.hidden = state.complete;
  reportCard.hidden = !state.complete;
  render();
  if (!state.failed && !state.complete) dayTimer = window.setTimeout(prepareNextDay, 1100);
}

function render() {
  const plant = plants[state.plant];
  const mission = missionForDay();
  const weather = weathers[state.weatherPlan[state.day - 1]];
  if (!state.evaluated) state.mood = moodFromInputs();
  app.dataset.mood = state.mood;
  app.dataset.plant = state.plant;
  app.dataset.stage = String(state.stage);
  app.dataset.complete = String(state.complete);
  app.dataset.weather = weather.className;
  $("#dayLabel").textContent = `${state.day} / 6`;
  $("#healthLabel").textContent = state.health;
  $("#moodLabel").textContent = state.mood.toUpperCase();
  $("#plantEmoji").textContent = plant.emoji;
  $("#speakerName").textContent = `${plant.name.toUpperCase()} SAYS`;
  $("#gardenMessage").textContent = careMessage();
  $("#potMark").textContent = plant.mark;
  $("#careClue").textContent = plant.clue;
  $("#lightValue").textContent = `${state.light}%`;
  $("#waterValue").textContent = `${state.water}%`;
  $("#stageEmoji").textContent = state.complete ? plant.emoji : stages[state.stage].emoji;
  $("#stageName").textContent = stages[state.stage].name;
  $("#weatherLabel").textContent = `${weather.emoji} ${weather.name}`;

  $("#missionTitle").textContent = state.complete ? "✓ Plant fully grown" : state.evaluated && !state.failed ? "✓ Day complete" : mission.title;
  $("#missionProgress").textContent = state.complete ? "Start a new seed to play again" : state.failed ? "Try this day again" : missionReady() ? "Ready to check!" : mission.hint;

  const ready = missionReady();
  nextDayButton.disabled = state.evaluated || state.complete || !ready;
  $("#nextDayIcon").textContent = state.complete ? "🌟" : ready ? "✓" : "🔒";
  $("#nextDayText").textContent = state.complete ? "Fully grown" : ready ? (state.day === 6 ? "Finish" : "Check day") : "Do today’s task";
  sunDownButton.disabled = state.evaluated || state.complete;
  sunUpButton.disabled = state.evaluated || state.complete;
  waterButton.disabled = state.evaluated || state.complete;
  waterDownButton.disabled = state.evaluated || state.complete;
  $(".sound-dock").classList.toggle("music-needed", state.day % 2 === 0 && state.music === "silence" && !state.evaluated);
  retryButton.hidden = !state.failed;
  $("#missionCard").hidden = state.complete;
  reportCard.hidden = !state.complete;
  if (state.complete) {
    $("#reportPlant").textContent = plant.emoji;
    $("#reportTitle").textContent = `${plant.name} grew in 6 days!`;
    $("#reportLight").textContent = `☀ ${plant.lightText}`;
    $("#reportWater").textContent = `💧 ${plant.waterText}`;
    $("#reportPath").textContent = `🌰 → 🌱 → ${plant.emoji}`;
    $("#reportBadge").textContent = plant.badge;
  }
  document.querySelectorAll("#stageTrack span").forEach((step, index) => {
    step.classList.toggle("active", index <= state.stage);
    step.classList.toggle("current", index === state.stage);
  });
  document.querySelectorAll(".plant-option").forEach((button) => {
    const selected = button.dataset.plantChoice === state.plant;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const sun = $(".sun");
  sun.style.opacity = Math.max(.08, state.light / 100);
  sun.style.transform = `scale(${.55 + state.light / 170})`;
}

function resetPlant(type = state.plant) {
  window.clearTimeout(dayTimer);
  const plant = plants[type];
  state.plant = type;
  state.day = 1;
  state.light = clamp(plant.light[0] - 20);
  state.water = clamp(plant.water[0] - 15);
  state.music = "silence";
  state.health = 80;
  state.stage = 0;
  state.mood = "curious";
  state.evaluated = false;
  state.failed = false;
  state.complete = false;
  state.actions = { sun: false, water: false, music: false };
  state.weatherPlan = createWeatherPlan();
  applyWeather(1);
  state.dayStart = { light: state.light, water: state.water, health: state.health };
  document.querySelector('input[name="music"][value="silence"]').checked = true;
  learningCard.hidden = true;
  reportCard.hidden = true;
  render();
}

function retryDay() {
  state.light = state.dayStart.light;
  state.water = state.dayStart.water;
  state.health = state.dayStart.health;
  state.mood = "curious";
  state.evaluated = false;
  state.failed = false;
  state.actions = { sun: false, water: false, music: false };
  state.music = "silence";
  document.querySelector('input[name="music"][value="silence"]').checked = true;
  learningCard.hidden = true;
  render();
}

sunDownButton.addEventListener("click", () => { state.light = clamp(state.light - 10); state.actions.sun = true; learningCard.hidden = true; render(); });
sunUpButton.addEventListener("click", () => { state.light = clamp(state.light + 10); state.actions.sun = true; learningCard.hidden = true; render(); });
waterButton.addEventListener("click", () => { state.water = clamp(state.water + 15); state.actions.water = true; learningCard.hidden = true; render(); });
waterDownButton.addEventListener("click", () => { state.water = clamp(state.water - 15); state.actions.water = true; learningCard.hidden = true; render(); });
document.querySelectorAll('input[name="music"]').forEach((input) => input.addEventListener("change", (event) => { state.music = event.target.value; state.actions.music = event.target.value !== "silence"; render(); }));
document.querySelectorAll(".plant-option").forEach((button) => button.addEventListener("click", () => resetPlant(button.dataset.plantChoice)));
nextDayButton.addEventListener("click", evaluateDay);
retryButton.addEventListener("click", retryDay);
resetButton.addEventListener("click", () => resetPlant());
growAgainButton.addEventListener("click", () => resetPlant());

resetPlant("sunflower");
