# BOW Sports Capital: Pregame

Cap & Contracts front-office simulator built as a static browser game.

## Run Locally
1. Download or clone this repository.
2. Open `/index.html` directly in your browser.
3. Pick a team and start a 12-week run.

Notes:
- No backend is required.
- No build tools are required.
- If your browser blocks local JSON fetches on `file://`, the game automatically falls back to embedded data so it still plays.

## Deploy to GitHub Pages
1. Create a GitHub repository and push these files.
2. In GitHub, open **Settings > Pages**.
3. Under **Build and deployment**, choose:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` (or your default branch), folder `/ (root)`
4. Save.
5. Wait for the Pages URL to appear, then open it.

## File Structure
- `/index.html`
- `/styles.css`
- `/game.js`
- `/data/teams.json`
- `/data/players.json`
- `/data/content-pack.json` (optional external event-content pack)

## How to Add Teams (`/data/teams.json`)
Each team object should include:
- `name`
- `marketSize` (`small`, `med`, `large`)
- `ownerTemperament` (`patient`, `neutral`, `impatient`)
- `startingValueB`
- `startingPatience`
- `storyline`
- `startingRoster` (array of player names)

Example:
```json
{
  "name": "Example Team",
  "marketSize": "med",
  "ownerTemperament": "neutral",
  "startingValueB": 3.5,
  "startingPatience": 65,
  "storyline": "Short team background.",
  "startingRoster": ["Player One", "Player Two"]
}
```

## How to Add Players (`/data/players.json`)
Each player object should include:
- `name`
- `team` (must match a team name or `Free Agent`)
- `position` (`PG`, `SG`, `SF`, `PF`, `C`)
- `overall` (0–100)
- `age`
- `salaryM` (in millions)
- `yearsLeft`
- `optionType` (`none` or `player`)
- `durability` (0–100)
- `source` (`real` or `generated`)

Example:
```json
{
  "name": "Example Player",
  "team": "Example Team",
  "position": "SF",
  "overall": 82,
  "age": 25,
  "salaryM": 14.5,
  "yearsLeft": 2,
  "optionType": "none",
  "durability": 86,
  "source": "generated"
}
```

## How to Add/Update Event Content Pack (`/data/content-pack.json`)
`game.js` now loads this file automatically when present and merges those event seeds with built-in defaults.

Structure:
- `name`
- `version`
- `description`
- `eventSeeds` object by category:
  - `extension`
  - `option`
  - `tax`
  - `trade`
  - `injury`
  - `pr`
  - `breakout`
  - `sponsor`
  - `philosophy`

Each seed can be either:
- object: `{ \"title\": \"...\", \"description\": \"...\" }`
- array: `[\"title\", \"description\"]`

## Data + Gameplay Notes
- Player salaries/ratings are **game approximations**, not exact real-world values.
- Real teams and player names are text-only references.
- No logos, official marks, or copyrighted images are used.
