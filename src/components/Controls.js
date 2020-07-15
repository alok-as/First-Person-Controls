import React, { Component, Fragment } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

class Controls extends Component {
	componentDidMount() {
		this.initScene();
		this.setUpControls();
		this.createCube();
		this.createFloor();
		this.buttonRef.addEventListener("click", () => {
			this.controls.lock();
		});
		document.addEventListener("keydown", this.onKeyDown);
		document.addEventListener("keyup", this.onKeyUp);
		window.addEventListener("resize", this.resizeWindowHandler);
		this.animate();
	}

	//Setting up the Scene
	initScene = () => {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xffffff);

		this.camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
		this.camera.position.z = 9;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.mountRef.appendChild(this.renderer.domElement);
	};

	// Making the scene Responsive
	resizeWindowHandler = () => {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	};

	//Adding the Per Frame Rendering
	animate = () => {
		requestAnimationFrame(this.animate);
		this.playerMovment();
		this.renderer.render(this.scene, this.camera);
	};

	//Creating a Cube
	createCube = () => {
		let geometry, material;
		geometry = new THREE.BoxGeometry(2, 2, 2);
		material = new THREE.MeshBasicMaterial({ color: 0x4ceb34 });
		this.cube = new THREE.Mesh(geometry, material);
		this.objects.push(this.cube);
		this.scene.add(this.cube);
	};

	//Constructing a Floor
	createFloor = () => {
		let size = 30;
		let divisions = 10;

		this.grid = new THREE.GridHelper(size, divisions, 0x000000, 0x000000);
		this.grid.position.y = -1;
		this.scene.add(this.grid);
	};

	//Setting Up First Person Controls
	setUpControls = () => {
		this.controls = new PointerLockControls(this.camera, document.body);
		this.controls.addEventListener("lock", () => {
			this.buttonRef.style.opacity = "0";
			this.buttonRef.style.pointerEvents = "none";
		});
		this.controls.addEventListener("unlock", () => {
			this.buttonRef.style.opacity = "1";
			this.buttonRef.style.pointerEvents = "all";
		});

		//Helper for Key Camera Movements
		this.raycaster = new THREE.Raycaster(
			new THREE.Vector3(),
			new THREE.Vector3(0, -1, 0),
			0,
			10
		);
		this.objects = [];
		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;
		this.prevTime = performance.now();
		this.velocity = new THREE.Vector3();
		this.direction = new THREE.Vector3();
	};

	//Setting Up Keydown and Keyup Events
	onKeyDown = (event) => {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				this.moveForward = true;
				break;

			case 37: // left
			case 65: // a
				this.moveLeft = true;
				break;

			case 40: // down
			case 83: // s
				this.moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				this.moveRight = true;
				break;

			default:
				return;
		}
	};

	onKeyUp = (event) => {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				this.moveForward = false;
				break;

			case 37: // left
			case 65: // a
				this.moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				this.moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				this.moveRight = false;
				break;

			default:
				return;
		}
	};

	playerMovment = () => {
		if (this.controls.isLocked === true) {
			this.raycaster.ray.origin.copy(this.controls.getObject().position);
			// this.raycaster.ray.origin.y -= 10;

			var intersections = this.raycaster.intersectObjects(this.objects, true);
			var onObject = intersections.length > 0;

			let time = performance.now();
			let delta = (time - this.prevTime) / 1000;

			this.velocity.x -= this.velocity.x * 10.0 * delta;
			this.velocity.z -= this.velocity.z * 10.0 * delta;
			this.velocity.y -= 9.8 * 100 * delta;

			this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
			this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
			this.direction.normalize();

			if (onObject === true) {
				this.velocity.y = Math.max(0, this.velocity.y);
			}

			if (this.moveForward || this.moveBackward)
				this.velocity.z -= this.direction.z * 150.0 * delta;

			if (this.moveLeft || this.moveRight)
				this.velocity.x -= this.direction.x * 150.0 * delta;

			//To Stop Controls from moving out in Z direction
			if (this.controls.getObject().position.z > 15) {
				this.controls.getObject().position.z = 15;
			} else if (this.controls.getObject().position.z < -14) {
				this.controls.getObject().position.z = -14;
			}

			// To stop controls from moving out in X direction
			if (this.controls.getObject().position.x > 15) {
				this.controls.getObject().position.x = 15;
			} else if (this.controls.getObject().position.x < -15) {
				this.controls.getObject().position.x = -15;
			}

			this.controls.moveForward(-this.velocity.z * delta);
			this.controls.moveRight(-this.velocity.x * delta);
			// this.controls.getObject().position.y += this.velocity.y * delta;

			if (this.controls.getObject().position.y < 10) {
				this.velocity.y = 0;
				// this.controls.getObject().position.y = 0;
			}

			this.prevTime = time;
		}
	};

	//Cleaning up
	componentWillMount() {
		window.removeEventListener("resize", this.resizeWindowHandler);
		document.removeEventListener("keydown", this.onKeyDown);
		document.removeEventListener("keyup", this.onKeyUp);
	}

	render() {
		return (
			<Fragment>
				<button
					type="button"
					ref={(ref) => (this.buttonRef = ref)}
					style={{
						fontSize: "1.5rem",
						padding: "1.2rem",
						color: "white",
						backgroundColor: "orangered",
						border: "none",
						outline: "none",
						cursor: "pointer",
					}}
				>
					Lock Controls
				</button>
				<div ref={(ref) => (this.mountRef = ref)}></div>
			</Fragment>
		);
	}
}

export default Controls;
