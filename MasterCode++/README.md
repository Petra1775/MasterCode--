# CodeMaster++ Phaser prototype

## Run the game

Serve this folder from a local web server, then open its address in a modern browser. For example, use the VS Code **Live Server** extension and open `index.html` with Live Server. Browser modules will not run reliably when opening the HTML file directly from disk.

## Connect Supabase

1. Create a Supabase project.
2. Open `supabase-schema.sql` in the Supabase SQL Editor and run it.
3. Copy the project's **Project URL** and **anon/public key** into `src/supabase.js`.
4. Reload the game and select **Akaun / Supabase** to register or sign in.

The anon/public key belongs in browser code. Never use a service-role key here. The SQL enables row-level security so authenticated players can access only their own saved progress and quiz attempts. Guest progress is saved in this browser's local storage; after sign-in it is uploaded as the account's initial save when no cloud save exists.

## Current playable flow

- Walk with WASD or the arrow keys; press **E** near a character or place to interact.
- Complete the easy pointer quiz at the village shop. All three answers must be correct to earn 60 coins and 100 XP.
- Spend 50 coins at the kijang trader, then travel to the haunted garden.
- Pass Tok Wak's medium quiz to receive the Bunga Melur, then continue to the forest.
- Type a C++ pointer example that declares an integer, points to it, and prints the dereferenced value. A correct solution sounds the Serunai and awards the Susuk Sanggul.
- Visit Puteri Saadong with the three story items to finish the adventure. Press **P** to view progress and inventory.

## Modular Phaser world

The game map is assembled as a Phaser tilemap in `src/worlds/TileWorld.js`. It has separate **Ground**, **World**, and **Above Player** layers so terrain, scenery, and foreground details can be changed independently. The tile atlas is drawn once from the palette for each level, and the level layout is generated from tile coordinates. Keep landmark positions in `Game.js` aligned with the paths in `TileWorld.js` when you move quest locations.

The main character's seven walking poses are in `assets/main_character/walk_cycle.png`; Phaser plays them as a loop while a movement key is held and returns to the idle portrait when the player stops. To edit the poses, update the source character sheet `assets/main_character/mc.png` and regenerate the cropped cycle with the same 52 × 62 frame size used in `Start.js`.

Progress and quiz results save automatically. The Supabase project URL/key are intentionally left blank until you connect your own project.
