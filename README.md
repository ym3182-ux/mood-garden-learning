# Mood Garden — Learn by Caring

Mood Garden is a six-day interactive plant-care game for children. Players choose a sunflower, fern, or cactus, then adjust light, water, and music according to the plant's needs and the day's weather. The plant responds with facial expressions, short messages, and visible growth from seed to seedling to a mature plant.

## Live project

- [Play Mood Garden](https://mood-garden.heatherma1026.chatgpt.site/)

## Learning goal

The project introduces basic planting knowledge through cause and effect:

- Different plants prefer different light and moisture ranges.
- Too little or too much water can both harm a plant.
- Weather changes the starting conditions each day.
- Healthy growth requires repeated care, not one perfect click.

## Interaction and logic

The interface combines several inputs:

- Light decrease / increase buttons
- Water decrease / increase buttons
- Quiet, calm, or upbeat sound choices
- Plant selection and daily care check

JavaScript variables track the selected plant, day, growth stage, light, moisture, music, weather, health, mood, and completed actions. Event listeners update those values. Conditional logic compares the player's choices with each plant's preferred ranges and decides whether the plant grows, asks for another attempt, or changes emotion.

## Growth loop

1. A daily weather condition sets the starting light and moisture.
2. The player adjusts both values.
3. On days 2, 4, and 6, the player also chooses music.
4. The game checks the combined state.
5. Successful care advances the day; unsuccessful care explains the problem and allows a retry.
6. After day 6, a growth report summarizes the plant's preferred conditions.

## Files

- `index.html` — interface and accessible controls
- `styles.css` — layout, plant illustrations, emotions, and responsive design
- `app.js` — state, events, combined-condition logic, retries, and progression

## Course context

Created by Yingrui for the “Responding to the World” module. The project explores how multiple input states can combine into meaningful, expressive feedback.
