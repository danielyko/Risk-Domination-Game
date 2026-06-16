# ⚔ Risk: World Domination

A browser-based world-conquest strategy game in the style of *Risk* — classic
42-territory / 6-continent world map, dice combat, troop cards, AI opponents,
animations and procedural battle music. Pure HTML/CSS/JS, **no build step and no
external assets** (audio is synthesized with the Web Audio API), so it runs fully
offline. Plays on **desktop and mobile** (mouse, touch).

## How to run
Open `index.html` in any modern browser, or serve the folder:

```bash
cd risk-world-domination
python3 -m http.server 8000
# then visit http://localhost:8000
```

## How to play
1. **Choose generals** — 3 to 6 players total (you + AI). Each starts with armies
   distributed across randomly-assigned territories.
2. **Reinforce** — you get `max(3, territories ÷ 3)` armies, **plus a bonus for
   every continent you fully control** (N.America 5, S.America 2, Europe 5,
   Africa 3, Asia 7, Australia 2). Tap your territories to place armies.
3. **Attack** — tap one of your territories (2+ armies), then an adjacent enemy.
   Roll the dice: attacker rolls up to 3, defender up to 2; highest dice are
   compared in pairs, **ties go to the defender**. Reduce a territory to 0 to
   **conquer** it, then choose how many armies to move in. Use **Auto-Attack** to
   blitz a battle to its conclusion.
4. **Fortify** — move armies once between two connected friendly territories.
5. **Cards** — conquer at least one territory in a turn to earn a card. Trade a
   set of 3 (all same, all different, or any 2 + a wild ⭐) for bonus armies
   (4, 6, 8, 10, 12, 15, then +5 each). You must trade if you hold 5+ cards.
   +2 extra armies if you own a territory pictured on a traded card.
6. **Win** by being the last general standing.

## Controls
- 🎲 dice combat panel · 🂠 cards · phase button (top-right) to advance turn
- 🏷 toggle territory names · 🎵 music on/off · 🔊 sound effects on/off

## Files
| File | Purpose |
|------|---------|
| `index.html` | App shell & setup screen |
| `css/style.css` | All styling, responsive layout, animations |
| `js/map-data.js` | 42 territories: shapes, centers, adjacencies, continents |
| `js/audio.js` | Procedural battle music + SFX (Web Audio API) |
| `js/game.js` | Game state, phases, dice combat, cards, AI, rendering, FX |
