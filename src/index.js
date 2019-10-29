import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
class App extends Component {
  componentDidMount() {
    var THREE = require('three');

    var scene = new THREE.Scene();
    const perspective = 50;
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      perspective * 2
    );
    // scene.background = new THREE.Color(0x000000);
    // scene.fog = new THREE.Fog(0x000000, 0, perspective);

    // var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    // light.position.set(0.5, 1, 0.75);
    // scene.add(light);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const size = 1;
    var geometry = new THREE.BoxGeometry(size, size, size);
    for (var i = 0; i < geometry.faces.length - 1; i += 2) {
      const color = Math.random() * 0xffffff;
      geometry.faces[i].color.setHex(color);
      geometry.faces[i + 1].color.setHex(color);
    }

    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: THREE.FaceColors
    });

    let cubeArray = [];
    const generateCubes = () => {
      for (let xIndex = -perspective; xIndex <= perspective; xIndex += 5) {
        for (let yIndex = -perspective; yIndex <= perspective; yIndex += 5) {
          for (let zIndex = -perspective; zIndex <= perspective; zIndex += 5) {
            var cube = new THREE.Mesh(geometry, material);
            cube.position.set(xIndex, yIndex, zIndex);
            cubeArray.push(cube);
            scene.add(cube);
          }
        }
      }
    };

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
      map[e.keyCode] = e.type == 'keydown';

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
      map[e.keyCode] = e.type == 'keydown';

      if (e.key === 'ArrowUp') {
        movingForward = false;
      }
      if (e.key === 'ArrowDown') {
        movingBackward = false;
      }
      // if (e.key === 'd') {
      //   movingRight = false;
      // }
      // if (e.key === 'a') {
      //   movingLeft = false;
      // }
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

    // window.addEventListener('keydown', e => {
    //   if (e.key === 'w') {
    //     camera.position.z -= 100;
    //   }
    //   if (e.key === 's') {
    //     camera.position.z += 100;
    //   }
    //   if (e.key === 'd') {
    //     camera.position.x += 100;
    //   }
    //   if (e.key === 'a') {
    //     camera.position.x -= 100;
    //   }
    //   if (e.key === 'q') {
    //     camera.position.y += 100;
    //   }
    //   if (e.key === 'e') {
    //     camera.position.y -= 100;
    //   }
    // });

    generateCubes();
    camera.position.z = perspective;

    var animate = function() {
      requestAnimationFrame(animate);
      if (movingForward) {
        camera.position.z -= 0.6 * Math.cos(camera.rotation.y);
        camera.position.x -= 0.6 * Math.sin(camera.rotation.y);
      }
      if (movingBackward) {
        camera.position.z += 0.6 * Math.cos(camera.rotation.y);
        camera.position.x += 0.6 * Math.sin(camera.rotation.y);
      }
      if (movingRight) {
        camera.position.z -= 0.6 * Math.sin(camera.rotation.y);
        camera.position.x += 0.6 * Math.cos(camera.rotation.y);
      }
      if (movingLeft) {
        camera.position.z += 0.6 * Math.sin(camera.rotation.y);
        camera.position.x -= 0.6 * Math.cos(camera.rotation.y);
      }

      movingUp && (camera.position.y += 60);
      movingDown && (camera.position.y -= 60);
      turningRight && (camera.rotation.y -= 0.02);
      turningLeft && (camera.rotation.y += 0.02);

      cubeArray.forEach(cube => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();
  }
  render() {
    return <div ref={ref => (this.mount = ref)} />;
  }
}
const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
