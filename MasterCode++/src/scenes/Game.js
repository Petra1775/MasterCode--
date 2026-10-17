import { freshProgress, loadProgress, saveProgress } from '../progress.js';
import { createTileWorld } from '../worlds/TileWorld.js';

const QUIZZES = {
    1: [
        { q: 'What does a pointer store?', choices: ['A memory address', 'A whole program', 'Only text'], answer: 0 },
        { q: 'Which operator gets a variable address?', choices: ['*', '&', '%'], answer: 1 },
        { q: 'Which declaration makes an integer pointer?', choices: ['int p;', 'int* p;', 'pointer int p;'], answer: 1 }
    ],
    2: [
        { q: 'Given int score = 12; int* p = &score; what is *p?', choices: ['The address of p', '12', 'A null pointer'], answer: 1 },
        { q: 'What is a safe initial value for a pointer with no target?', choices: ['nullptr', '0.5', '&nullptr'], answer: 0 },
        { q: 'What does *ptr do in an expression?', choices: ['Dereferences ptr', 'Finds a variable name', 'Creates a reference'], answer: 0 }
    ]
};

export class Game extends Phaser.Scene {
    constructor() { super('Game'); }

    init(data) { this.initialProgress = data?.progress || null; }

    async create() {
        this.progress = this.initialProgress || await loadProgress() || freshProgress();
        this.busy = false;
        this.makeWorld();
        this.makePlayer();
        this.makeHud();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E,P,ESC');
        this.refreshHud();
        this.events.once('shutdown', () => this.domOverlay?.remove());
    }

    makeWorld() {
        const w = this.scale.width, h = this.scale.height;
        createTileWorld(this, this.progress.level);
        this.add.rectangle(w / 2, 31, w, 62, 0x16251d, 0.78).setDepth(-5);
        this.add.text(34, 21, this.progress.level === 1 ? 'JEMBAL VILLAGE' : this.progress.level === 2 ? 'HAUNTED GARDEN' : 'SERUNAI FOREST', {
            fontFamily: 'Georgia', fontSize: '25px', fontStyle: 'bold', color: '#fff0cc', stroke: '#37251a', strokeThickness: 4
        }).setDepth(-4);
        this.add.text(34, h - 42, 'WASD / Arrow keys: move     E: interact     P: progress', {
            fontFamily: 'Georgia', fontSize: '17px', color: '#fff5dc', stroke: '#302319', strokeThickness: 3
        }).setDepth(8);
        this.add.text(w - 30, h - 42, 'ESC: menu', { fontFamily: 'Georgia', fontSize: '17px', color: '#fff5dc' }).setOrigin(1, 0).setDepth(8)
            .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('Start'));

        this.landmarks = [];
        if (this.progress.level === 1) {
            this.addLandmark(280, 365, '🏪', 'Pointer Shop', 'shop');
            this.addLandmark(930, 230, '🦌', this.progress.kijang ? 'Kijang' : 'Kijang Trader', 'deer');
            this.addLandmark(1030, 525, '🌿', 'Road to Haunted Garden', 'road');
            this.add.text(775, 126, 'Riverside village', { fontFamily: 'Georgia', fontSize: '22px', color: '#fff4d5', stroke: '#273321', strokeThickness: 4 }).setDepth(-2);
        } else if (this.progress.level === 2) {
            this.addLandmark(910, 255, '🧙', 'Tok Wak', 'witch');
            this.addLandmark(300, 500, '🌼', 'Bunga Melur', 'flower');
            this.addLandmark(1080, 515, '🎶', 'Road to the forest', 'road');
            this.addLandmark(150, 540, '🏡', 'Road back to Jembal Village', 'home');
            this.add.text(700, 120, 'Find Tok Wak in the quiet garden', { fontFamily: 'Georgia', fontSize: '23px', color: '#fff4d5', stroke: '#263121', strokeThickness: 4 }).setDepth(-2);
        } else {
            this.addLandmark(960, 290, '🎵', 'Serunai', 'flute');
            this.addLandmark(310, 500, '👑', 'Puteri Saadong', 'princess');
            this.addLandmark(150, 540, '🏡', 'Road back to Jembal Village', 'home');
            this.add.text(695, 126, 'Sound the flute to break the curse', { fontFamily: 'Georgia', fontSize: '22px', color: '#fff4d5', stroke: '#201c36', strokeThickness: 4 }).setDepth(-2);
        }
    }

    addLandmark(x, y, icon, label, kind) {
        const g = this.add.container(x, y).setDepth(1);
        const glow = this.add.circle(0, 0, 42, 0x17160f, 0.67).setStrokeStyle(3, 0xffd97b, 0.75);
        const badge = this.add.text(0, 0, icon, { fontFamily: 'Segoe UI Emoji', fontSize: '43px' }).setOrigin(0.5);
        const caption = this.add.text(0, 49, label, { fontFamily: 'Georgia', fontSize: '18px', fontStyle: 'bold', color: '#fff4d5', stroke: '#2c2116', strokeThickness: 4 }).setOrigin(0.5);
        g.add([glow, badge, caption]);
        this.landmarks.push({ x, y, kind, label, glow });
    }

    makePlayer() {
        this.player = this.add.container(600, 475).setDepth(5);
        this.player.add(this.add.ellipse(0, 41, 40, 13, 0x16130f, 0.58));
        if (!this.anims.exists('player-walk')) {
            this.anims.create({ key: 'player-walk', frames: this.anims.generateFrameNumbers('mc_walk', { start: 0, end: 6 }), frameRate: 9, repeat: -1 });
        }
        const sprite = this.add.sprite(0, 0, 'mc_idle').setDisplaySize(78, 93);
        this.player.add(sprite);
        this.playerSprite = sprite;
    }

    makeHud() {
        this.hud = this.add.container(1245, 44).setDepth(15);
        this.hudBg = this.add.rectangle(0, 0, 390, 49, 0x291e17, 0.86).setStrokeStyle(2, 0xe5c486).setOrigin(1, 0.5);
        this.hudText = this.add.text(-18, 0, '', { fontFamily: 'Georgia', fontSize: '19px', color: '#fff0ce', fontStyle: 'bold' }).setOrigin(1, 0.5);
        this.hud.add([this.hudBg, this.hudText]);
        this.prompt = this.add.text(640, 620, '', { fontFamily: 'Georgia', fontSize: '25px', fontStyle: 'bold', color: '#fff1c8', backgroundColor: '#33251dcc', padding: { x: 18, y: 11 } }).setOrigin(0.5).setDepth(12);
    }

    refreshHud() { this.hudText.setText(`🪙 ${this.progress.coins}     ✨ ${this.progress.xp} XP     🎒 ${this.progress.inventory.length}`); }

    async persist() { await saveProgress(this.progress); this.refreshHud(); }

    update() {
        if (!this.player || this.busy) return;
        const speed = 3.3;
        let dx = 0, dy = 0;
        if (this.cursors.left.isDown || this.keys.A.isDown) dx--;
        if (this.cursors.right.isDown || this.keys.D.isDown) dx++;
        if (this.cursors.up.isDown || this.keys.W.isDown) dy--;
        if (this.cursors.down.isDown || this.keys.S.isDown) dy++;
        const length = Math.hypot(dx, dy) || 1;
        this.player.x = Phaser.Math.Clamp(this.player.x + dx / length * speed, 70, 1210);
        this.player.y = Phaser.Math.Clamp(this.player.y + dy / length * speed, 120, 650);
        this.playerSprite.setFlipX(dx < 0);
        this.playerSprite.setY(dy < 0 ? -3 : 0);
        if (dx || dy) this.playerSprite.play('player-walk', true);
        else {
            this.playerSprite.anims.stop();
            this.playerSprite.setTexture('mc_idle');
        }
        const nearby = this.landmarks.find((m) => Phaser.Math.Distance.Between(this.player.x, this.player.y, m.x, m.y) < 100);
        this.landmarks.forEach((m) => m.glow.setStrokeStyle(nearby === m ? 5 : 3, nearby === m ? 0xffe27f : 0xffd97b, 0.9));
        this.prompt.setText(nearby ? `E  ·  ${nearby.label}` : '');
        if (Phaser.Input.Keyboard.JustDown(this.keys.E) && nearby) this.interact(nearby.kind);
        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) this.showProgress();
        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.scene.start('Start');
    }

    interact(kind) {
        if (kind === 'home') return this.enterLevel(1);
        if (kind === 'shop') return this.startQuiz(1);
        if (kind === 'deer') return this.buyKijang();
        if (kind === 'road' && this.progress.level === 1) {
            if (!this.progress.kijang) return this.message('You need a ride first', 'Earn 50 coins from the quiz and buy a kijang in the village.');
            return this.enterLevel(2);
        }
        if (kind === 'witch') return this.progress.completed.includes(2) ? this.message('Tok Wak', 'You have the Bunga Melur. Follow the road to Serunai Forest.') : this.startQuiz(2);
        if (kind === 'flower') return this.progress.completed.includes(2) ? this.message('Bunga Melur', 'The flower is already in your inventory.') : this.message('The flower is protected', 'Complete Tok Wak’s medium quiz first.');
        if (kind === 'road' && this.progress.level === 2) return this.enterLevel(3);
        if (kind === 'flute') return this.startCodingChallenge();
        if (kind === 'princess') return this.progress.gameComplete ? this.message('The End', 'The curse is broken. Well done, adventurer!') : this.finishMission();
    }

    buyKijang() {
        if (this.progress.kijang) return this.message('Your kijang is ready', 'Your ride can take you to the Haunted Garden.');
        if (!this.progress.completed.includes(1)) return this.message('Kijang Trader', 'Complete the pointer quiz at the shop to earn coins first.');
        if (this.progress.coins < 50) return this.message('Not enough coins', 'The kijang costs 50 coins.');
        this.progress.coins -= 50;
        this.progress.kijang = true;
        this.progress.inventory.push('Kijang');
        this.persist();
        this.message('Kijang purchased!', 'The kijang is in your inventory. Head to the road to the Haunted Garden.');
    }

    enterLevel(level) {
        this.progress.level = level;
        this.persist();
        this.scene.restart({ progress: this.progress });
    }

    startQuiz(level) {
        if (this.progress.completed.includes(level)) return this.message('Level complete', level === 1 ? 'You passed the quiz. Buy a kijang to continue your journey.' : 'Tok Wak has given you the Bunga Melur.');
        const questions = QUIZZES[level];
        this.busy = true;
        let index = 0, score = 0;
        const ask = () => {
            const item = questions[index];
            const choices = item.choices.map((label, i) => ({ label, onClick: () => {
                if (i === item.answer) score++;
                index++;
                if (index < questions.length) ask();
                else this.finishQuiz(level, score, questions.length);
            } }));
            this.choiceDialog(level === 1 ? `Easy Quiz  ${index + 1}/${questions.length}` : `Tok Wak’s Medium Quiz  ${index + 1}/${questions.length}`, item.q, choices);
        };
        ask();
    }

    async finishQuiz(level, score, total) {
        this.progress.quizScores.push({ level, score, total, date: new Date().toISOString() });
        if (score !== total) {
            await this.persist();
            return this.choiceDialog('Try again', `Score: ${score}/${total}. Answer every question correctly to pass this level.`, [{ label: 'Retry quiz', onClick: () => this.startQuiz(level) }, { label: 'Return to map', onClick: () => { this.busy = false; this.clearDialog(); } }]);
        }
        this.progress.completed.push(level);
        this.progress.coins += level === 1 ? 60 : 40;
        this.progress.xp += level === 1 ? 100 : 150;
        if (level === 2 && !this.progress.inventory.includes('Bunga Melur')) this.progress.inventory.push('Bunga Melur');
        await this.persist();
        this.choiceDialog('Level complete!', level === 1 ? 'All answers are correct! +60 coins and +100 XP. Spend 50 coins to buy a kijang.' : 'Tok Wak gives you the Bunga Melur! +40 coins and +150 XP.', [{ label: 'Return to map', onClick: () => { this.busy = false; this.clearDialog(); } }]);
    }

    startCodingChallenge() {
        if (this.progress.completed.includes(3)) return this.message('The Serunai has sounded', 'The Susuk Sanggul is in your inventory. Go to Puteri Saadong.');
        this.busy = true;
        this.dialogTitle = 'C++ Pointer Challenge';
        this.dialogText = 'Complete the code so p points to the integer and the flute prints its value. Example: number = 7, p = &number, cout << *p;';
        this.dialogButtons = [];
        this.dialog = this.add.container(0, 0).setDepth(1000);
        this.dialog.add(this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x10140f, 0.72).setInteractive());
        this.domOverlay = document.createElement('div');
        this.domOverlay.style.cssText = 'box-sizing:border-box;width:min(700px,calc(100vw - 40px));max-height:calc(100vh - 40px);overflow:auto;padding:22px;background:#f2dfb8;border:5px solid #4a3020;border-radius:14px;color:#38271d;font-family:Georgia;box-shadow:0 8px 30px #0009';
        this.domOverlay.innerHTML = `<h2 style="margin:0 0 10px;text-align:center;font-size:28px">${this.dialogTitle}</h2><p style="margin:0 0 14px;text-align:center;line-height:1.4">${this.dialogText}</p><textarea aria-label="C++ code" style="box-sizing:border-box;width:100%;height:180px;padding:14px;background:#201f22;color:#f6e8ca;font:18px Consolas,monospace;border-radius:8px;resize:vertical">int number = 7;\nint* p = &number;\ncout << *p;</textarea><div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:12px"><button data-action="submit" style="padding:10px 24px;background:#873d32;color:white;border:0;border-radius:7px;font:bold 18px Georgia;cursor:pointer">Run code</button><button data-action="close" style="padding:10px 24px;background:#6c5947;color:white;border:0;border-radius:7px;font:bold 18px Georgia;cursor:pointer">Back</button></div><div data-result style="margin-top:10px;text-align:center;font-weight:bold"></div>`;
        this.challengeElement = this.add.dom(this.scale.width / 2, this.scale.height / 2, this.domOverlay).setDepth(1001);
        this.domOverlay.querySelector('[data-action="submit"]').onclick = () => this.checkCode(this.domOverlay.querySelector('textarea').value);
        this.domOverlay.querySelector('[data-action="close"]').onclick = () => { this.challengeElement.destroy(); this.challengeElement = null; this.domOverlay = null; this.busy = false; this.clearDialog(); };
    }

    async checkCode(source) {
        const code = source.replace(/\s+/g, '').toLowerCase();
        const variable = code.match(/int([a-z_]\w*)=7;?/);
        const pointer = code.match(/int\*([a-z_]\w*)=&([a-z_]\w*);?/);
        const output = code.match(/cout<<\*([a-z_]\w*);?/);
        const valid = Boolean(variable && pointer && output && pointer[2] === variable[1] && output[1] === pointer[1]);
        const result = this.domOverlay.querySelector('[data-result]');
        if (!valid) { result.textContent = 'Not quite. Check &, *, and cout, then try again.'; result.style.color = '#a22f28'; return; }
        this.challengeElement.destroy(); this.challengeElement = null; this.domOverlay = null;
        this.playSerunai();
        this.progress.completed.push(3);
        this.progress.coins += 50;
        this.progress.xp += 200;
        this.progress.codingSubmissions.push({ source, passed: true, date: new Date().toISOString() });
        if (!this.progress.inventory.includes('Susuk Sanggul')) this.progress.inventory.push('Susuk Sanggul');
        await this.persist();
        this.choiceDialog('The Serunai sounds!', 'Code accepted! +50 coins and +200 XP. The Susuk Sanggul is in your inventory.', [{ label: 'Go to the princess', onClick: () => { this.busy = false; this.clearDialog(); this.player.setPosition(400, 500); } }]);
    }

    finishMission() {
        const required = ['Kijang', 'Bunga Melur', 'Susuk Sanggul'];
        const missing = required.filter((item) => !this.progress.inventory.includes(item));
        if (missing.length) return this.message('Mission incomplete', `Puteri Saadong still needs: ${missing.join(', ')}.`);
        this.progress.gameComplete = true;
        this.progress.xp += 100;
        this.persist();
        this.message('The curse is broken!', 'Puteri Saadong is free. Congratulations! You completed all the C++ pointer challenges.');
    }

    playSerunai() {
        try {
            const audio = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(523.25, audio.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(784, audio.currentTime + 0.65);
            gain.gain.setValueAtTime(0.0001, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.15, audio.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.85);
            oscillator.connect(gain); gain.connect(audio.destination);
            oscillator.start(); oscillator.stop(audio.currentTime + 0.9);
            oscillator.onended = () => audio.close();
        } catch (error) { console.warn('Audio playback is unavailable.', error); }
    }

    showProgress() {
        const items = this.progress.inventory.length ? this.progress.inventory.join('  ·  ') : 'No items yet';
        const done = [1, 2, 3].map((n) => `Level ${n}: ${this.progress.completed.includes(n) ? 'Complete' : 'Not complete'}`).join('\n');
        this.message('Progress and inventory', `Coins: ${this.progress.coins}     XP: ${this.progress.xp}\n${done}\n\nInventory: ${items}`);
    }

    message(title, body) { this.choiceDialog(title, body, [{ label: 'Close', onClick: () => { this.busy = false; this.clearDialog(); } }]); }

    choiceDialog(title, body, buttons) {
        this.busy = true;
        this.dialogTitle = title; this.dialogText = body; this.dialogButtons = buttons;
        this.drawDialog();
    }

    drawDialog() {
        this.clearDialog();
        const w = this.scale.width, h = this.scale.height;
        const panelWidth = Math.min(850, w - 40);
        const title = this.add.text(w / 2, 0, this.dialogTitle, {
            fontFamily: 'Georgia', fontSize: '31px', fontStyle: 'bold', color: '#38271d', align: 'center',
            wordWrap: { width: panelWidth - 64 }
        }).setOrigin(0.5, 0);
        const body = this.add.text(w / 2, 0, this.dialogText, {
            fontFamily: 'Georgia', fontSize: '22px', color: '#38271d', align: 'center', lineSpacing: 7,
            wordWrap: { width: panelWidth - 72 }
        }).setOrigin(0.5, 0);
        const titleHeight = Math.max(38, title.getBounds().height);
        const bodyHeight = Math.max(32, body.getBounds().height);
        const count = this.dialogButtons?.length || 0;
        const gap = 12;
        const buttonWidth = count ? Math.min(280, (panelWidth - 48 - gap * (count - 1)) / count) : 0;
        const buttonLabels = (this.dialogButtons || []).map((item) => this.add.text(0, 0, item.label, {
            fontFamily: 'Georgia', fontSize: '19px', fontStyle: 'bold', color: '#fff1d2', align: 'center',
            wordWrap: { width: buttonWidth - 18 }
        }).setOrigin(0.5));
        const buttonHeight = count ? Math.max(58, ...buttonLabels.map((label) => label.getBounds().height + 20)) : 0;
        const panelHeight = Math.min(h - 32, 28 + titleHeight + 16 + bodyHeight + 22 + buttonHeight + 24);
        const top = (h - panelHeight) / 2;

        this.dialog = this.add.container(0, 0).setDepth(1000);
        this.dialog.add(this.add.rectangle(w / 2, h / 2, w, h, 0x10140f, 0.72).setInteractive());
        this.dialog.add(this.add.rectangle(w / 2, h / 2, panelWidth, panelHeight, 0xf2dfb8).setStrokeStyle(6, 0x4a3020));
        title.setPosition(w / 2, top + 22);
        body.setPosition(w / 2, top + 22 + titleHeight + 14);
        this.dialog.add([title, body]);

        if (count) {
            const buttonY = top + panelHeight - buttonHeight / 2 - 18;
            this.dialogButtons.forEach((item, i) => {
                const x = w / 2 + (i - (count - 1) / 2) * (buttonWidth + gap);
                const button = this.add.rectangle(x, buttonY, buttonWidth, buttonHeight, 0x873d32).setInteractive({ useHandCursor: true });
                const label = buttonLabels[i].setPosition(x, buttonY);
                button.on('pointerover', () => button.setFillStyle(0xa34b3c));
                button.on('pointerout', () => button.setFillStyle(0x873d32));
                button.on('pointerdown', item.onClick);
                this.dialog.add([button, label]);
            });
        }
    }

    clearDialog() { this.dialog?.destroy(); this.dialog = null; }
}
