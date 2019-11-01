import React, { Component } from 'react';
import './App.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import axios from 'axios';
import Cookies from 'js-cookie';
import generateRoom from './generateRoom';

class App extends Component {
  async componentDidMount() {
    let renderer, camera, scene, controls, light, cart;

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

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;

      generateRoom({
        scene,
        products,
        cubeArray
      });
      //cart
      let cartGeometry = new THREE.BoxBufferGeometry(20, 10, 15);
      let cartCanvas = document.createElement('canvas');
      let cartCanvasContext = cartCanvas.getContext('2d');
      cartCanvas.width = cartCanvas.height = 256;
      cartCanvasContext.shadowColor = '#000';
      cartCanvasContext.shadowBlur = 7;
      cartCanvasContext.fillStyle = 'grey';
      cartCanvasContext.fillRect(0, 0, cartCanvas.width, cartCanvas.height);

      cartCanvasContext.fillStyle = 'orange';
      cartCanvasContext.font = '30pt arial bold';
      cartCanvasContext.fillText('Cart', 72, 128);

      let cartMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.Texture(cartCanvas)
      });
      cartMaterial.map.needsUpdate = true;

      cart = new THREE.Mesh(cartGeometry, cartMaterial);
      cart.cartId = Cookies.get('cart');
      cart.content = [];

      cart.velocity = new THREE.Vector3(0, 0, 0);
      cart.position.set(40, 5, -40);
      cart.doubleSided = true;
      cart.castShadow = true;
      cart.receiveShadow = true;
      scene.add(cart);
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
              let movementVector = new THREE.Vector3();
              this.pickedObject.velocity.y = 0.2;

              if (this.pickedObject.position.distanceTo(camera.position) > 15) {
                this.pickedObject.translateOnAxis(
                  movementVector
                    .subVectors(camera.position, this.pickedObject.position)
                    .normalize(),
                  0.8
                );
              }
              if (this.pickedObject.position.distanceTo(camera.position) < 15) {
                this.pickedObject.translateOnAxis(
                  movementVector
                    .subVectors(this.pickedObject.position, camera.position)
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

    let posted = false;

    var animate = function(time) {
      time *= 0.001;
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
      let cartBB = new THREE.Box3().setFromObject(cart);

      cubeArray.forEach(async cube => {
        if (
          cartBB.containsBox(new THREE.Box3().setFromObject(cube)) &&
          !posted
        ) {
          posted = true;
          await axios
            .post('http://localhost:5000/api/carts/' + Cookies.get('cart'), {
              id: cube.data.id,
              item: cube.data.item,
              quantity: 1,
              price: 0.01
            })
            .then(res => {
              console.log(res);
            })
            .catch(error => {
              console.log(error);
            });
        }
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
