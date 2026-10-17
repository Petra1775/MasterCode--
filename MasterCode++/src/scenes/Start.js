import { loadProgress, saveProgress, signIn, signUp } from '../progress.js';

export class Start extends Phaser.Scene {
    constructor() { super('Start'); this.audioMuted = false; }

    preload() {
        this.load.image('home_ui', 'assets/home_ui.png');
        this.load.image('mc_idle', 'assets/main_character/mc_idle.png');
        this.load.spritesheet('mc_walk', 'assets/main_character/walk_cycle.png', { frameWidth: 52, frameHeight: 62 });
    }

    create() {
        const w = this.scale.width, h = this.scale.height;
        this.add.image(w / 2, h / 2, 'home_ui').setDisplaySize(w, h);
        this.add.rectangle(390, h / 2, 770, h, 0x1a2118, 0.28);
        this.add.text(58, 55, 'CodeMaster++', { fontFamily: 'Georgia', fontSize: '66px', fontStyle: 'bold', color: '#ffe1a6', stroke: '#30251d', strokeThickness: 8 });
        this.add.text(64, 135, 'A web adventure for learning C++ pointers', { fontFamily: 'Georgia', fontSize: '24px', fontStyle: 'italic', color: '#fff0cf', stroke: '#30251d', strokeThickness: 3 });
        this.add.text(66, 207, 'Help Puteri Saadong with your C++ pointer skills.', { fontFamily: 'Georgia', fontSize: '20px', color: '#fff5e0', stroke: '#30251d', strokeThickness: 3 });

        this.createCard(65, 275, 'START GAME', 'Explore the village, answer quizzes,\nand collect story items.', 'Continue journey', () => this.startGame());
        this.createCard(445, 275, 'POINTER NOTES', 'Review pointer concepts\nbefore taking on challenges.', 'Open notes', () => this.showPointerNotes());
        this.createSmallButton(72, 625, 205, 'Account / Supabase', () => this.showAccount());
        this.createSmallButton(294, 625, 190, 'Progress', () => this.showProgress());
        this.createSmallButton(501, 625, 170, this.audioMuted ? 'Sound: off' : 'Sound: on', () => this.toggleAudio());

        this.add.text(1244, 690, 'WASD / Arrow keys to move · E to interact', { fontFamily: 'Georgia', fontSize: '16px', color: '#fff5e0', stroke: '#30251d', strokeThickness: 3 }).setOrigin(1, 1);
    }

    createCard(x, y, heading, description, buttonText, onClick) {
        const panel = this.add.graphics();
        panel.fillStyle(0x201811, 0.72).fillRoundedRect(x + 7, y + 9, 350, 280, 18);
        panel.fillStyle(0xf2dfb8, 1).fillRoundedRect(x, y, 350, 280, 18);
        panel.lineStyle(5, 0x4a3020, 1).strokeRoundedRect(x, y, 350, 280, 18);
        panel.lineStyle(2, 0xb8874d, 1).strokeRoundedRect(x + 10, y + 10, 330, 260, 12);
        this.add.text(x + 25, y + 22, heading, { fontFamily: 'Georgia', fontSize: '27px', fontStyle: 'bold', color: '#38271d' });
        const divider = this.add.graphics().lineStyle(2, 0x9b7045, 1).lineBetween(x + 24, y + 65, x + 326, y + 65);
        this.add.text(x + 25, y + 84, description, { fontFamily: 'Georgia', fontSize: '21px', color: '#38271d', lineSpacing: 8 });
        const button = this.add.rectangle(x + 175, y + 225, 280, 58, 0x873d32).setInteractive({ useHandCursor: true });
        this.add.text(x + 175, y + 225, buttonText, { fontFamily: 'Lora', fontSize: '23px', fontStyle: 'bold', color: '#fff1d2' }).setOrigin(0.5);
        button.on('pointerover', () => button.setFillStyle(0xa34b3c));
        button.on('pointerout', () => button.setFillStyle(0x873d32));
        button.on('pointerdown', onClick);
        return divider;
    }

    createSmallButton(x, y, buttonWidth, label, onClick) {
        const button = this.add.rectangle(x + buttonWidth / 2, y + 25, buttonWidth, 52, 0xf2dfb8)
            .setStrokeStyle(4, 0x4a3020).setInteractive({ useHandCursor: true });
        this.add.text(x + buttonWidth / 2, y + 25, label, { fontFamily: 'Georgia', fontSize: '18px', color: '#38271d' }).setOrigin(0.5);
        button.on('pointerover', () => button.setFillStyle(0xffedce));
        button.on('pointerout', () => button.setFillStyle(0xf2dfb8));
        button.on('pointerdown', onClick);
    }

    async startGame() {
        const progress = await loadProgress();
        this.scene.start('Game', { progress });
    }

    async showProgress() {
        const p = await loadProgress();
        const completed = [1, 2, 3].map((n) => `Level ${n}: ${p.completed.includes(n) ? 'Complete' : 'Not complete'}`).join('\n');
        this.showMessage('Progress', `Coins: ${p.coins}     XP: ${p.xp}\n${completed}\nInventory: ${p.inventory.join(', ') || 'Empty'}`);
    }

    showAccount() {
        const panel = this.makeShade();
        const form = document.createElement('div');
        form.style.cssText = 'box-sizing:border-box;width:min(460px,calc(100vw - 40px));max-height:calc(100vh - 40px);overflow:auto;padding:22px;background:#f2dfb8;border:5px solid #4a3020;border-radius:14px;color:#38271d;font:18px Georgia;box-shadow:0 8px 30px #0009';
        form.innerHTML = `<h2 style="margin:0 0 8px;text-align:center">Player account</h2><p style="margin:0 0 14px;text-align:center;line-height:1.4">Sign in or register to save progress to Supabase. Guest progress stays on this device.</p><input data-name placeholder="Full name (for registration)" style="box-sizing:border-box;width:100%;padding:12px;margin:5px 0;font:16px Georgia"><input data-email type="email" placeholder="Email" style="box-sizing:border-box;width:100%;padding:12px;margin:5px 0;font:16px Georgia"><input data-password type="password" placeholder="Password" style="box-sizing:border-box;width:100%;padding:12px;margin:5px 0;font:16px Georgia"><div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:12px 0"><button data-login style="padding:10px;background:#873d32;color:white;border:0;border-radius:6px;font:bold 16px Georgia;cursor:pointer">Sign in</button><button data-signup style="padding:10px;background:#6d553d;color:white;border:0;border-radius:6px;font:bold 16px Georgia;cursor:pointer">Register</button><button data-close style="padding:10px;background:#aaa;color:#222;border:0;border-radius:6px;font:bold 16px Georgia;cursor:pointer">Close</button></div><div data-status style="min-height:24px;text-align:center;overflow-wrap:anywhere"></div>`;
        const dom = this.add.dom(this.scale.width / 2, this.scale.height / 2, form).setDepth(1001);
        const status = form.querySelector('[data-status]');
        const submit = async (mode) => {
            const email = form.querySelector('[data-email]').value.trim();
            const password = form.querySelector('[data-password]').value;
            const name = form.querySelector('[data-name]').value.trim();
            if (!email || !password) { status.textContent = 'Enter your email and password.'; return; }
            if (mode === 'signup' && (!/^.{8,}$/.test(password) || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password))) {
                status.textContent = 'Use 8+ characters with upper- and lowercase letters, a number, and a symbol.'; return;
            }
            status.textContent = 'Connecting...';
            try {
                if (mode === 'signup') await signUp(email, password, name);
                else await signIn(email, password);
                const p = await loadProgress();
                await saveProgress(p);
                dom.destroy(); panel.destroy();
                this.showMessage('Account connected', 'Game progress will sync to Supabase when a connection is available.');
            } catch (error) { status.textContent = error.message || 'Could not connect to the account.'; }
        };
        form.querySelector('[data-login]').onclick = () => submit('login');
        form.querySelector('[data-signup]').onclick = () => submit('signup');
        form.querySelector('[data-close]').onclick = () => { dom.destroy(); panel.destroy(); };
    }

    makeShade() {
        const w = this.scale.width, h = this.scale.height;
        const shade = this.add.container(0, 0).setDepth(1000);
        shade.add(this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.72).setInteractive());
        return shade;
    }

    makePopup(title, body) {
        const w = this.scale.width, h = this.scale.height, panelWidth = Math.min(700, w - 40);
        const heading = this.add.text(w / 2, 0, title, { fontFamily: 'Georgia', fontSize: '31px', fontStyle: 'bold', color: '#38271d', align: 'center', wordWrap: { width: panelWidth - 60 } }).setOrigin(0.5, 0);
        const message = this.add.text(w / 2, 0, body, { fontFamily: 'Georgia', fontSize: '20px', color: '#38271d', align: 'center', lineSpacing: 6, wordWrap: { width: panelWidth - 60 } }).setOrigin(0.5, 0);
        const headingHeight = Math.max(38, heading.getBounds().height), messageHeight = Math.max(28, message.getBounds().height);
        const panelHeight = Math.min(h - 32, 28 + headingHeight + 18 + messageHeight + 24 + 54 + 20);
        const top = (h - panelHeight) / 2;
        const popup = this.add.container(0, 0).setDepth(1000);
        popup.add(this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.68).setInteractive());
        popup.add(this.add.rectangle(w / 2, h / 2, panelWidth, panelHeight, 0xf2dfb8).setStrokeStyle(6, 0x4a3020));
        popup.closeY = top + panelHeight - 40;
        heading.setPosition(w / 2, top + 22);
        message.setPosition(w / 2, top + 22 + headingHeight + 14);
        popup.add([heading, message]);
        return popup;
    }

    showMessage(title, body) {
        const popup = this.makePopup(title, body);
        const close = this.add.text(this.scale.width / 2, popup.closeY, 'CLOSE', { fontFamily: 'Georgia', fontSize: '20px', color: '#ffffff', backgroundColor: '#873d32', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => popup.destroy()); popup.add(close);
    }

    showPointerNotes() {
        const w = this.scale.width, h = this.scale.height;
        const panelWidth = Math.min(1000, w - 40), panelHeight = Math.min(630, h - 40);
        const left = (w - panelWidth) / 2, top = (h - panelHeight) / 2;
        const popup = this.add.container(0, 0).setDepth(1000);
        popup.add(this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.75).setInteractive());
        popup.add(this.add.rectangle(w / 2, h / 2, panelWidth, panelHeight, 0xf2dfb8).setStrokeStyle(6, 0x4a3020));
        popup.add(this.add.text(w / 2, top + 28, 'C++ POINTER NOTES', { fontFamily: 'Georgia', fontSize: '32px', fontStyle: 'bold', color: '#38271d' }).setOrigin(0.5));
        popup.add(this.add.text(left + 38, top + 82, 'A pointer is a variable that stores the memory address of another variable.\nThe & operator gets an address. The * operator declares a pointer or reads\nthe value stored at that address.', { fontFamily: 'Georgia', fontSize: '20px', color: '#38271d', lineSpacing: 8, wordWrap: { width: panelWidth - 76 } }));
        popup.add(this.add.text(left + 38, top + 198, 'Example:\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int number = 10;\n    int* pointer = &number;\n    cout << *pointer;  // Prints 10\n    return 0;\n}', { fontFamily: 'Consolas', fontSize: '18px', color: '#38271d', lineSpacing: 4 }));
        popup.add(this.add.text(left + 38, top + panelHeight - 98, 'Tip: Initialize unused pointers safely with nullptr.\nNever dereference a pointer that does not refer to a valid address.', { fontFamily: 'Georgia', fontSize: '18px', color: '#38271d', lineSpacing: 6, wordWrap: { width: panelWidth - 76 } }));
        const close = this.add.text(w / 2, top + panelHeight - 28, 'CLOSE', { fontFamily: 'Georgia', fontSize: '21px', color: '#ffffff', backgroundColor: '#873d32', padding: { x: 20, y: 9 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => popup.destroy()); popup.add(close);
    }

    toggleAudio() { this.audioMuted = !this.audioMuted; this.sound.mute = this.audioMuted; this.scene.restart(); }
}
