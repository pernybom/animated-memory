import React, { Component } from 'react';
import './App.css';
import * as THREE from 'three';

//https://threejs.org/examples/webgl_modifier_tessellation.html
//

class App extends Component {
  componentDidMount() {
    let renderer, camera, scene, controls, light;
    const canvas = document.querySelector('#c');
    const init = () => {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

      camera = new THREE.PerspectiveCamera(75, 2, 0.1, 10000);

      scene = new THREE.Scene();

      let pLight = new THREE.PointLight();
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

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;

      const size = canvas.clientHeight / 1500;

      let cubeArray = [];

      const generateCubes = () => {
        const cubeOfCubeSize = 1;
        for (
          let xIndex = -cubeOfCubeSize;
          xIndex <= cubeOfCubeSize;
          xIndex += 5
        ) {
          for (
            let yIndex = -cubeOfCubeSize;
            yIndex <= cubeOfCubeSize;
            yIndex += 5
          ) {
            for (
              let zIndex = -cubeOfCubeSize;
              zIndex <= cubeOfCubeSize;
              zIndex += 5
            ) {
              var geometry = new THREE.BoxGeometry(size, size, size);

              var material = new THREE.MeshPhongMaterial({
                color: Math.random() * 0xffffff,
                shininess: 100
              });

              var cube = new THREE.Mesh(geometry, material);
              cube.castShadow = true;
              cube.receiveShadow = true;
              cube.position.set(xIndex, yIndex, zIndex);
              cube.velocity = new THREE.Vector3(0, 0, 0);
              cubeArray.push(cube);
            }
          }
        }
      };
      generateCubes();
      cubeArray.forEach(cube => {
        scene.add(cube);
      });

      const generateRoom = () => {
        const size = 60;
        const positions = [
          [size, 0, 0],
          [-size, 0, 0],
          [0, size, 0],
          [0, -size, 0],
          [0, 0, size],
          [0, 0, -size]
        ];
        let geometry = new THREE.PlaneGeometry(size * 2, size * 2);
        positions.forEach(position => {
          let material = new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff
          });
          let plane = new THREE.Mesh(geometry, material);
          plane.receiveShadow = true;
          plane.position.set(position[0], position[1], position[2]);
          plane.lookAt(0, 0, 0);
          scene.add(plane);
        });
      };

      generateRoom();

      const cameraPole = new THREE.Object3D();
      scene.add(cameraPole);
      cameraPole.add(camera);
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

          this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
          this.pickedObject.material.emissive.setHex(
            (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000
          );

          // let movementVector = new THREE.Vector3();

          // this.pickedObject.translateOnAxis(
          //   movementVector
          //     .subVectors(camera.position, this.pickedObject.position)
          //     .normalize(),
          //   0.5
          // );
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
    let turningRight = false;
    let turningLeft = false;
    var map = {};

    onkeydown = function(e) {
      e.preventDefault();
      map[e.keyCode] = e.type === 'keydown';

      if (e.key === 'ArrowUp') {
        movingForward = true;
      }
      if (e.key === 'ArrowDown') {
        movingBackward = true;
      }
      if (e.key === 'd') {
        movingRight = true;
      }
      if (e.key === 'a') {
        movingLeft = true;
      }
      if (e.key === ' ') {
        movingUp = true;
      }
      if (e.key === 'c') {
        movingDown = true;
      }
      if (e.key === 'ArrowRight') {
        turningRight = true;
      }
      if (e.key === 'ArrowLeft') {
        turningLeft = true;
      }
    };
    onkeyup = function(e) {
      e.preventDefault();
      map[e.keyCode] = e.type === 'keydown';

      if (e.key === 'ArrowUp') {
        movingForward = false;
      }
      if (e.key === 'ArrowDown') {
        movingBackward = false;
      }
      if (e.key === 'd') {
        movingRight = false;
      }
      if (e.key === 'a') {
        movingLeft = false;
      }
      if (e.key === ' ') {
        movingUp = false;
      }
      if (e.key === 'c') {
        movingDown = false;
      }
      if (e.key === 'ArrowRight') {
        turningRight = false;
      }
      if (e.key === 'ArrowLeft') {
        turningLeft = false;
      }
    };
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
      let speed = 1;

      if (movingForward) {
        camera.position.z -= speed * Math.cos(camera.rotation.y);
        camera.position.x -= speed * Math.sin(camera.rotation.y);
      }
      if (movingBackward) {
        camera.position.z += speed * Math.cos(camera.rotation.y);
        camera.position.x += speed * Math.sin(camera.rotation.y);
      }
      if (movingRight) {
        camera.position.z -= speed * Math.sin(camera.rotation.y);
        camera.position.x += speed * Math.cos(camera.rotation.y);
      }
      if (movingLeft) {
        camera.position.z += speed * Math.sin(camera.rotation.y);
        camera.position.x -= speed * Math.cos(camera.rotation.y);
      }

      movingUp && (camera.position.y += speed);
      movingDown && (camera.position.y -= speed);
      turningRight && (camera.rotation.y -= 0.02);
      turningLeft && (camera.rotation.y += 0.02);

      //pickHelper.pick(pickPosition, scene, camera, time);

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
