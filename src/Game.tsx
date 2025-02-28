import Phaser from "phaser";
import React, { useEffect, useState } from "react";
import bomb from "./assets/bomb.png";
import dude from "./assets/dude.png";
import ground from "./assets/platform.png";
import sky from "./assets/sky-01.jpg";
import star from "./assets/star.png";
import { buttonConfig } from "./button-config";
import { useResize } from "./hooks/useResize";

const Game: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const { width, height } = useResize();

  class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private stars!: Phaser.Physics.Arcade.Group;
    private bombs!: Phaser.Physics.Arcade.Group;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private gameOver: boolean = false;

    constructor() {
      super("GameScene");
    }

    preload() {
      console.log("Preloading assets...");
      this.load.image("sky", sky);
      this.load.image("ground", ground);
      this.load.image("star", star);
      this.load.image("bomb", bomb);
      this.load.spritesheet("dude", dude, {
        frameWidth: 32,
        frameHeight: 48,
      });
    }

    create() {
      console.log("GameScene created");
      this.add.image(360, 640, "sky");
      this.platforms = this.physics.add.staticGroup();
      this.platforms.create(360, 1248, "ground").setScale(2).refreshBody();
      this.platforms.create(560, 1080, "ground");
      this.platforms.create(45, 930, "ground");
      this.platforms.create(675, 900, "ground");

      this.player = this.physics.add.sprite(100, 930, "dude");
      this.player.setBounce(0.2);
      this.player.setCollideWorldBounds(true);

      this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20,
      });

      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });

      this.cursors = this.input.keyboard.createCursorKeys();

      this.stars = this.physics.add.group({
        key: "star",
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 63 },
      });
      this.stars.children.iterate((child) => {
        (child as Phaser.Physics.Arcade.Sprite).setBounceY(
          Phaser.Math.FloatBetween(0.4, 0.8)
        );
      });

      this.bombs = this.physics.add.group();
      this.scoreText = this.add.text(16, 36, "Score: 0", {
        fontSize: "32px",
        fill: "#fff",
      });

      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.stars, this.platforms);
      this.physics.add.collider(this.bombs, this.platforms);
      this.physics.add.overlap(
        this.player,
        this.stars,
        this.collectStar,
        undefined,
        this
      );
      this.physics.add.collider(
        this.player,
        this.bombs,
        this.hitBomb,
        undefined,
        this
      );
    }

    update() {
      if (this.gameOver) {
        setGameStarted(false);
      }

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
        this.player.anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
        this.player.anims.play("right", true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play("turn");
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }
    }

    private collectStar = (
      player: Phaser.GameObjects.GameObject,
      star: Phaser.GameObjects.GameObject
    ) => {
      (star as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);

      if (this.stars.countActive(true) === 0) {
        this.stars.children.iterate((child) => {
          (child as Phaser.Physics.Arcade.Sprite).enableBody(
            true,
            child.x,
            0,
            true,
            true
          );
        });

        const x =
          this.player.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);
        const bomb = this.bombs.create(
          x,
          16,
          "bomb"
        ) as Phaser.Physics.Arcade.Sprite;
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
      }
    };

    private hitBomb = (
      player: Phaser.GameObjects.GameObject,
      bomb: Phaser.GameObjects.GameObject
    ) => {
      this.physics.pause();
      (player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000);
      this.gameOver = true;
    };
  }

  useEffect(() => {
    if (!gameStarted) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 720, // Math.min(720, width),
      height: 1280, //Math.min(1280, height),
      parent: "game-container",
      scene: GameScene,
      physics: { default: "arcade", arcade: { gravity: { y: 300 } } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    };

    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, [gameStarted, width, height]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        id="game-container"
        style={{ position: "relative", width: width, height: height }}
      />
      {!gameStarted && (
        <button
          onClick={() => setGameStarted(true)}
          style={{
            ...buttonConfig.buttonStyle,
            position: "absolute",
            transform: "translateX(-50%)",
          }}
        >
          {buttonConfig.buttonText}
        </button>
      )}
    </div>
  );
};

export default Game;
