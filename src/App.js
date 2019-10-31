import React, { Component } from 'react';
import './App.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

//https://threejs.org/examples/webgl_modifier_tessellation.html
//

class App extends Component {
  componentDidMount() {
    let renderer, camera, scene, controls, light, cameraPole;
    var prevTime = performance.now();
    var velocity = new THREE.Vector3();
    var direction = new THREE.Vector3();
    var vertex = new THREE.Vector3();
    var color = new THREE.Color();
    let mouseHold = false;
    const canvas = document.querySelector('#c');
    const init = () => {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

      camera = new THREE.PerspectiveCamera(75, 2, 0.1, 10000);
      camera.position.y = 10;

      scene = new THREE.Scene();

      controls = new PointerLockControls(camera, canvas);

      scene.add(controls.getObject());

      let pLight = new THREE.PointLight(0xffffff, 0.3);
      scene.add(pLight);

      light = new THREE.DirectionalLight();
      light.position.z = 200;
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
        const size = 60;
        const positions = [
          [size, size, 0],
          [-size, size, 0],
          [0, 2 * size, 0],
          [0, 0, 0],
          [0, size, size],
          [0, size, -size]
        ];
        let geometry = new THREE.PlaneBufferGeometry(size * 2, size * 2);
        positions.forEach(position => {
          let material = new THREE.MeshPhongMaterial({
            color: 0xffffff
          });
          let plane = new THREE.Mesh(geometry, material);
          plane.receiveShadow = true;
          plane.position.set(position[0], position[1], position[2]);
          plane.lookAt(0, size, 0);
          scene.add(plane);
        });

        let cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
        let cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff });
        let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(20, 20, 20);
        scene.add(cube);
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
        if (this.pickedObject) {
          this.pickedObject.material.emissive.setHex(
            this.pickedObjectSavedColor
          );
          this.pickedOject = undefined;
        }
        this.raycaster.setFromCamera(normalizedPosition, camera);
        const intersectedObjects = this.raycaster.intersectObjects(
          scene.children
        );
        if (intersectedObjects.length) {
          this.pickedObject = intersectedObjects[0].object;
          if (this.pickedObject.geometry.type !== 'PlaneBufferGeometry') {
            this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
            this.pickedObject.material.emissive.setHex(
              (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000
            );
            if (mouseHold) {
              let movementVector = new THREE.Vector3();

              this.pickedObject.translateOnAxis(
                movementVector
                  .subVectors(camera.position, this.pickedObject.position)
                  .normalize(),
                0.5
              );
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
      pickPosition.y = +10000000;
    };

    const pickPosition = { x: 0, y: 0 };
    clearPickPosition();

    let movingForward = false;
    let movingBackward = false;
    let movingRight = false;
    let movingLeft = false;
    let movingUp = false;
    let movingDown = false;
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
        movingUp = true;
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
        var time = performance.now();
        var delta = (time - prevTime) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        direction.z = Number(movingForward) - Number(movingBackward);
        direction.x = Number(movingRight) - Number(movingLeft);
        direction.normalize(); // this ensures consistent movingments in all directions
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

      // cubeArray.forEach(cube => {
      //   cube.rotation.y += 0.01 * Math.random();
      //   cube.rotation.z += 0.01 * Math.random();
      //   cube.rotation.x += 0.01 * Math.random();
      // });
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
