import React, { Component } from 'react';
import './App.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import axios from 'axios';

//https://threejs.org/examples/webgl_modifier_tessellation.html
//

class App extends Component {
  async componentDidMount() {
    let renderer, camera, scene, controls, light, cameraPole;
    var prevTime = performance.now();
    var velocity = new THREE.Vector3();
    var direction = new THREE.Vector3();
    let mouseHold = false;
    let products = await axios.get('http://localhost:5000/api/products');
    let cubeArray = [];
    const canvas = document.querySelector('#c');
    const init = () => {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

      camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
      camera.position.y = 10;

      scene = new THREE.Scene();

      controls = new PointerLockControls(camera, canvas);
      controls.target = new THREE.Vector3(0, 10, 0);
      controls.maxDistance = 150;
      scene.add(controls.getObject());

      let pLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(pLight);

      light = new THREE.DirectionalLight();
      light.position.z = 200;
      light.position.y = 80;
      light.castShadow = true;
      light.shadow = new THREE.LightShadow(
        new THREE.PerspectiveCamera(50, 1, 10, 2500)
      );
      light.shadow.bias = 0.0001;
      light.shadow.mapSize.width = window.innerWidth;
      light.shadow.mapSize.height = window.innerHeight;
      scene.add(light);
      const cameraPole = new THREE.Object3D();
      scene.add(cameraPole);
      cameraPole.add(camera);

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;

      const generateRoom = () => {
        //walls
        const roomSize = 100;
        const positions = [
          [roomSize, roomSize, 0],
          [-roomSize, roomSize, 0],
          [0, 1.2 * roomSize, 0],
          [0, 0, 0],
          [0, roomSize, roomSize],
          [0, roomSize, -roomSize]
        ];
        let geometry = new THREE.PlaneBufferGeometry(
          roomSize * 2,
          roomSize * 2
        );
        positions.forEach(position => {
          let material = new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff
          });
          let plane = new THREE.Mesh(geometry, material);
          plane.receiveShadow = true;
          plane.position.set(position[0], position[1], position[2]);
          plane.lookAt(0, roomSize, 0);
          scene.add(plane);
        });

        //desk
        const deskSize = 6;
        let deskGeometry = new THREE.BoxBufferGeometry(
          roomSize * 0.8,
          deskSize,
          deskSize
        );
        let deskMaterial = new THREE.MeshPhongMaterial({
          color: 0xff0a30
        });
        let desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(0, deskSize / 2, -roomSize * 0.6);
        desk.receiveShadow = true;
        desk.castShadow = true;
        scene.add(desk);
        //products
        const cubeSize = 6;
        const shelfSize = 2;
        let cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

        let xCoord = -roomSize * 0.6;
        let yCoord = 10 + cubeSize / 2 + shelfSize;

        products.data.forEach((product, index) => {
          let x = document.createElement('canvas');
          let xc = x.getContext('2d');
          x.width = x.height = 256;
          xc.shadowColor = '#000';
          xc.shadowBlur = 7;
          xc.fillStyle = 'orange';
          xc.font = '15pt arial bold';
          console.log(product.item);
          xc.fillText(product.item + '\n' + product.price, 0, 128);

          let cubeMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.Texture(x)
          });
          cubeMaterial.map.needsUpdate = true;

          let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
          cube.velocity = new THREE.Vector3(0, 0, 0);
          cube.position.set(xCoord, yCoord, -97);
          xCoord += cubeSize * 4 - 2;
          if ((index + 1) % 6 === 0) {
            xCoord = -roomSize * 0.6;
            yCoord += 15;
          }
          cube.doubleSided = true;

          cube.castShadow = true;
          cube.receiveShadow = true;
          cubeArray.push(cube);
          scene.add(cube);
        });

        //shelves
        let shelfGeometry = new THREE.BoxBufferGeometry(
          1.5 * roomSize,
          shelfSize,
          3 * shelfSize
        );
        let shelfMaterial = new THREE.MeshPhongMaterial({
          color: 0x014f15
        });

        for (let i = 10 + shelfSize / 2; i < 71; i += 15) {
          let shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
          shelf.position.set(0, i, -97);
          shelf.castShadow = true;
          shelf.receiveShadow = true;
          scene.add(shelf);
        }
      };

      generateRoom();
    };

    class PickHelper {
      constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedOject = null;
        this.pickedObjectSavedColor = 0;
      }
      pick(normalizedPosition, scene, camera, time) {
        this.raycaster.setFromCamera(normalizedPosition, camera);
        const intersectedObjects = this.raycaster.intersectObjects(
          scene.children
        );
        if (intersectedObjects.length) {
          this.pickedObject = intersectedObjects[0].object;
          if (this.pickedObject.geometry.type === 'BoxGeometry') {
            if (mouseHold) {
              this.pickedObject.velocity.y = 0.1;
              let movementVector = new THREE.Vector3();

              if (this.pickedObject.position.distanceTo(camera.position) > 15) {
                this.pickedObject.translateOnAxis(
                  movementVector
                    .subVectors(camera.position, this.pickedObject.position)
                    .normalize(),
                  0.8
                );
              }
            }
          }
        }
      }
    }

    const getCanvasRelativePosition = event => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };

    const setPickPosition = event => {
      const pos = getCanvasRelativePosition(event);
      pickPosition.x = (pos.x / canvas.clientWidth) * 2 - 1;
      pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;
    };

    const clearPickPosition = () => {
      pickPosition.x = 10000000;
      pickPosition.y = 10000000;
    };

    let pickPosition = { x: 0, y: 0 };
    clearPickPosition();

    let movingForward = false;
    let movingBackward = false;
    let movingRight = false;
    let movingLeft = false;
    var map = {};

    onkeydown = function(e) {
      e.preventDefault();
      map[e.keyCode] = e.type === 'keydown';

      if (e.key === 'ArrowUp' || e.keyCode === 87) {
        movingForward = true;
      }
      if (e.key === 'ArrowDown' || e.keyCode === 83) {
        movingBackward = true;
      }
      if (e.keyCode === 39 || e.keyCode === 68) {
        movingRight = true;
      }
      if (e.keyCode === 37 || e.keyCode === 65) {
        movingLeft = true;
      }
      if (e.key === ' ' || e.keyCode === 32) {
        velocity.y += 350;
      }
      if (e.key === 'b') {
        controls.lock();
      }
      if (e.key === 'n') {
        controls.unlock();
      }
    };
    onkeyup = function(e) {
      e.preventDefault();
      map[e.keyCode] = e.type === 'keydown';

      if (e.key === 'ArrowUp' || e.keyCode === 87) {
        movingForward = false;
      }
      if (e.key === 'ArrowDown' || e.keyCode === 83) {
        movingBackward = false;
      }
      if (e.keyCode === 39 || e.keyCode === 68) {
        movingRight = false;
      }
      if (e.keyCode === 37 || e.keyCode === 65) {
        movingLeft = false;
      }
    };
    let raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );
    var objects = [];
    window.addEventListener('mousedown', () => (mouseHold = true));
    window.addEventListener('mouseup', () => (mouseHold = false));
    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);

    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

    const pickHelper = new PickHelper();

    init();

    var animate = function(time) {
      time *= 0.001;
      // cameraPole.rotation.y = time * 0.1;
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      if (controls.isLocked === true) {
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;
        var intersections = raycaster.intersectObjects(objects);
        var onObject = intersections.length > 0;
        time = performance.now();
        var delta = (time - prevTime) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        direction.z = Number(movingForward) - Number(movingBackward);
        direction.x = Number(movingRight) - Number(movingLeft);
        direction.normalize(); // this ensures consistent movements in all directions
        if (movingForward || movingBackward)
          velocity.z -= direction.z * 400.0 * delta;
        if (movingLeft || movingRight)
          velocity.x -= direction.x * 400.0 * delta;
        if (onObject === true) {
          velocity.y = Math.max(0, velocity.y);
        }
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        controls.getObject().position.y += velocity.y * delta; // new behavior
        if (controls.getObject().position.y < 10) {
          velocity.y = 0;
          controls.getObject().position.y = 10;
        }
        prevTime = time;
      }

      pickHelper.pick(pickPosition, scene, camera, time);

      cubeArray.forEach(cube => {
        cube.velocity.y -= 9.82 * 0.01;

        if (
          cube.position.y < 3 ||
          cube.position.z < -95 ||
          (cube.position.z > -64 &&
            cube.position.z < -56 &&
            cube.position.y < 9)
        ) {
          cube.velocity.y = 0;
        }
        cube.position.y += cube.velocity.y;
      });
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
  render() {
    return <div ref={ref => (this.mount = ref)} />;
  }
}

export default App;
