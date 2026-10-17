const TILE = 32;
const COLUMNS = 8;
const ROWS = 1;
const TILESET_KEY = 'codemaster-world-tiles';

const PALETTES = {
    1: { grass: '#587943', light: '#6e9150', dark: '#3e603a', path: '#b58a58', pathLight: '#c99f69', water: '#527e85', flower: '#e7c66c' },
    2: { grass: '#344c3b', light: '#496349', dark: '#283b34', path: '#746653', pathLight: '#92816a', water: '#445e69', flower: '#d8e0b0' },
    3: { grass: '#3e5261', light: '#536c72', dark: '#293947', path: '#8a7356', pathLight: '#ae9065', water: '#4a7383', flower: '#d7bd82' }
};

function makeTileset(scene, level) {
    if (scene.textures.exists(TILESET_KEY)) scene.textures.remove(TILESET_KEY);
    const texture = scene.textures.createCanvas(TILESET_KEY, TILE * COLUMNS, TILE * ROWS);
    const ctx = texture.getContext();
    const p = PALETTES[level] || PALETTES[3];

    const fillTile = (index, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(index * TILE, 0, TILE, TILE);
    };
    fillTile(0, p.grass);
    fillTile(1, p.path);
    fillTile(2, p.water);
    fillTile(3, p.dark);
    fillTile(4, p.light);
    fillTile(5, p.pathLight);
    fillTile(6, '#483b32');
    fillTile(7, p.flower);

    // Grass, path, and water each get small repeatable details so the grid reads as terrain.
    for (let i = 0; i < 28; i++) {
        const x = (i * 13 + 7) % TILE;
        const y = (i * 19 + 5) % TILE;
        ctx.fillStyle = i % 2 ? p.light : p.dark;
        ctx.fillRect(x, y, i % 5 === 0 ? 3 : 2, 2);
    }
    for (let i = 0; i < 18; i++) {
        const x = TILE + ((i * 11 + 4) % TILE);
        const y = (i * 17 + 3) % TILE;
        ctx.fillStyle = i % 2 ? p.pathLight : '#8d6745';
        ctx.fillRect(x, y, 3, 2);
    }
    for (let i = 0; i < 12; i++) {
        ctx.fillStyle = i % 2 ? '#79a4a0' : '#3d6874';
        ctx.fillRect(TILE * 2 + ((i * 7 + 3) % TILE), (i * 13 + 5) % TILE, 7, 2);
    }
    // Low bushes and flower patches are placed on the World layer.
    ctx.fillStyle = p.dark;
    ctx.fillRect(TILE * 3 + 4, 15, 24, 13);
    ctx.fillStyle = p.light;
    ctx.fillRect(TILE * 3 + 8, 9, 16, 15);
    ctx.fillRect(TILE * 3 + 1, 19, 10, 8);
    ctx.fillRect(TILE * 3 + 21, 18, 10, 9);
    ctx.fillStyle = p.dark;
    ctx.fillRect(TILE * 3 + 3, 27, 25, 3);
    ctx.fillStyle = p.flower;
    ctx.fillRect(TILE * 4 + 8, 10, 5, 5);
    ctx.fillRect(TILE * 4 + 20, 21, 5, 5);
    ctx.fillStyle = '#f1e4c6';
    ctx.fillRect(TILE * 4 + 9, 11, 2, 2);
    ctx.fillRect(TILE * 4 + 21, 22, 2, 2);
    // Small hut/wall marker and a stepping-stone tile for reusable map decoration.
    ctx.fillStyle = '#674532';
    ctx.fillRect(TILE * 5 + 3, 12, 26, 17);
    ctx.fillStyle = '#a75e42';
    ctx.fillRect(TILE * 5 + 1, 8, 30, 8);
    ctx.fillStyle = '#dfb57c';
    ctx.fillRect(TILE * 5 + 7, 18, 6, 11);
    ctx.fillStyle = '#d2c3a4';
    ctx.fillRect(TILE * 6 + 4, 8, 24, 16);
    ctx.fillStyle = '#8d8068';
    ctx.fillRect(TILE * 6 + 8, 12, 16, 8);
    ctx.fillStyle = p.flower;
    ctx.fillRect(TILE * 7 + 13, 5, 6, 6);
    ctx.fillRect(TILE * 7 + 7, 13, 6, 6);
    ctx.fillRect(TILE * 7 + 19, 13, 6, 6);
    ctx.fillRect(TILE * 7 + 13, 21, 6, 6);
    ctx.fillStyle = '#8c5547';
    ctx.fillRect(TILE * 7 + 13, 13, 6, 6);
    texture.refresh();
}

function createLayerData(level, name, width, height) {
    const data = Array.from({ length: height }, () => Array(width).fill(-1));
    const pathX = level === 1 ? 19 : level === 2 ? 24 : 18;
    if (name === 'Ground') {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const edge = x < 2 || y < 2 || x > width - 3 || y > height - 3;
                data[y][x] = edge ? 3 : 0;
                const path = Math.abs(x - pathX) <= 1 || (y > height - 8 && x > pathX - 3 && x < pathX + 12);
                if (path && !edge) data[y][x] = (x + y) % 3 === 0 ? 5 : 1;
                if (level === 1 && x > 4 && x < 10 && y > 6 && y < 9) data[y][x] = 2;
                if (level === 2 && x > 29 && x < 35 && y > 3 && y < 7) data[y][x] = 2;
                if (level === 3 && x > 5 && x < 12 && y > 5 && y < 9) data[y][x] = 2;
            }
        }
        return data;
    }
    // Keep the middle of the map open for walking; border bushes and scattered patches create modular scenery.
    if (name === 'World') {
        for (let x = 3; x < width - 3; x += 3) {
            data[3 + (x % 2)][x] = 3;
            data[height - 4 - (x % 2)][x] = 3;
        }
        for (let y = 6; y < height - 6; y += 5) {
            data[y][3] = 3;
            data[y][width - 4] = 3;
        }
        const points = level === 1 ? [[8, 7], [31, 5], [33, 16], [11, 18]]
            : level === 2 ? [[7, 8], [33, 6], [10, 17], [35, 17]]
                : [[8, 7], [31, 7], [10, 18], [34, 16]];
        for (const [x, y] of points) data[y][x] = 6;
        return data;
    }
    if (name === 'Above Player') {
        for (let x = 5; x < width - 5; x += 9) {
            data[5][x] = 3;
            data[height - 6][x + 2] = 3;
        }
    }
    return data;
}

export function createTileWorld(scene, level) {
    const width = 40, height = 24;
    makeTileset(scene, level);
    const map = scene.make.tilemap({ data: createLayerData(level, 'Ground', width, height), tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE, TILE, 0, 0);
    const ground = map.createLayer(0, tileset, 0, 0).setDepth(-20);
    const world = map.createBlankLayer('World', tileset, 0, 0).setDepth(-10);
    const above = map.createBlankLayer('Above Player', tileset, 0, 0).setDepth(8);
    const worldData = createLayerData(level, 'World', width, height);
    const aboveData = createLayerData(level, 'Above Player', width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (worldData[y][x] !== -1) world.putTileAt(worldData[y][x], x, y);
            if (aboveData[y][x] !== -1) above.putTileAt(aboveData[y][x], x, y);
        }
    }
    // Store references so the Game scene can reveal the player between map depth layers.
    scene.worldMap = map;
    scene.worldLayers = { ground, world, above };
    return { width: width * TILE, height: height * TILE, tileSize: TILE };
}
