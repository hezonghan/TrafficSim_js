
import * as THREE from 'three';
import { add_objects , movement } from './add_objects.js';
import { Simulator } from './simulator.js';

import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from '../node_modules/three/examples/jsm/shaders/FXAAShader.js';

// import Axios from 'axios';
// var net = require('net');
// import { connect } from 'net';


const camera_init = {
    "horizon": 48000,
    // "target_x": 1100,
    // "target_z": 1250,
    // "distance": 1300,
    "pitching_deg": -20,
    "rotation_y_deg": 0
}
const POSITION_MULTIPLE = 1;

const WINDOW_RESERVED_LEFT = 0 , WINDOW_RESERVED_RIGHT = 0 , WINDOW_RESERVED_UP = 60 , WINDOW_RESERVED_DOWN = 0;
const WINDOW_RESERVED_WIDTH = WINDOW_RESERVED_LEFT + WINDOW_RESERVED_RIGHT;
const WINDOW_RESERVED_HEIGHT = WINDOW_RESERVED_UP + WINDOW_RESERVED_DOWN;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, (window.innerWidth - WINDOW_RESERVED_WIDTH) / (window.innerHeight - WINDOW_RESERVED_HEIGHT), 0.1, camera_init.horizon * POSITION_MULTIPLE );
// var camera = new THREE.OrthographicCamera(-500 , 500 , 500 , -500 , 0.1 , 10000);
var renderer = new THREE.WebGLRenderer({
    antialias: true,
});
console.log( "window.innerWidth = " + window.innerWidth +" , window.innerHeight = "+ window.innerHeight );
renderer.setSize( window.innerWidth - WINDOW_RESERVED_WIDTH , window.innerHeight - WINDOW_RESERVED_HEIGHT );
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
// renderer.setPixelRatio( (window.innerWidth - WINDOW_RESERVED_WIDTH) / (window.innerHeight - WINDOW_RESERVED_HEIGHT) );
// renderer.setPixelRatio( window.devicePixelRatio * 1.3 );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );
// console.log(renderer.precision);
// console.log(window.devicePixelRatio , renderer.getPixelRatio());



// var render_pass = new RenderPass(scene , camera);

// var shader_pass = new ShaderPass(FXAAShader);
// shader_pass.uniforms['resolution'].value.set( window.innerWidth - WINDOW_RESERVED_WIDTH , window.innerHeight - WINDOW_RESERVED_HEIGHT );
// shader_pass.renderToScreen = true;

// var composer = new EffectComposer(renderer);
// composer.addPass(render_pass);
// composer.addPass(shader_pass);



// camera.position.set(1 , 1.5 , 6);
// camera.position.set(1 , 6 , 15);
camera.position.set(0 , 1.5 , 9);



var axesHelper = new THREE.AxesHelper(4500);
scene.add(axesHelper);

add_objects(scene);

var simulator = new Simulator(scene);
simulator.init_objects();





var camera_pitching = camera_init.pitching_deg * Math.PI / 180;
var camera_rotation_y = camera_init.rotation_y_deg * Math.PI / 180;  // -90 * Math.PI / 180;

var camera_euler = new THREE.Euler(camera_pitching , camera_rotation_y , 0 , 'YXZ');
camera.setRotationFromEuler(camera_euler);

const INIT_SPEED = 4;  // meter per second
const KEYS_HANDLE_INTERVAL = 50;  // ms
var walking_speed = INIT_SPEED * KEYS_HANDLE_INTERVAL / 1000;  // 1.6;  // 0.1;  // meter per frame

var control_mode = 2;

var keys_being_pressed = {}
function keys_handle() {

    if(control_mode == 0) {

        if(keys_being_pressed[81]) /*Q*/ {
            camera.position.y += walking_speed;
        }else if(keys_being_pressed[69]) /*E*/ {
            camera.position.y -= walking_speed;
        }

        if(keys_being_pressed[87]) /*W*/ {
            camera.position.z -= walking_speed * Math.cos(camera_rotation_y);
            camera.position.x -= walking_speed * Math.sin(camera_rotation_y);
        }else if(keys_being_pressed[83]) /*S*/ {
            camera.position.z += walking_speed * Math.cos(camera_rotation_y);
            camera.position.x += walking_speed * Math.sin(camera_rotation_y);
        }

        if(keys_being_pressed[65]) /*A*/ {
            camera.position.z += walking_speed * Math.sin(camera_rotation_y);
            camera.position.x -= walking_speed * Math.cos(camera_rotation_y);
        }else if(keys_being_pressed[68]) /*D*/ {
            camera.position.z -= walking_speed * Math.sin(camera_rotation_y);
            camera.position.x += walking_speed * Math.cos(camera_rotation_y);
        }

        if(keys_being_pressed[82]) /*R*/ {
            // walking_speed *= 2;
            walking_speed *= 1.0905077;  // 2^(1/8)
        }else if(keys_being_pressed[70]) /*F*/ {
            // walking_speed /= 2;
            walking_speed /= 1.0905077;
        }

        // if(keys_being_pressed[38]) /* up */ {
        //     camera.rotation.x -= 0.01;
        // }else if(keys_being_pressed[40]) /* down */ {
        //     camera.rotation.x += 0.01;
        // }

        if(keys_being_pressed[37]) /* left */ {
            camera_rotation_y += 0.02;
            if(camera_rotation_y >= Math.PI * 2) camera_rotation_y -= Math.PI * 2;
        }else if(keys_being_pressed[39]) /* right */ {
            camera_rotation_y -= 0.02;
            if(camera_rotation_y < 0) camera_rotation_y += Math.PI * 2;
        }

        // if(keys_being_pressed[]) /**/ {
        // }else if(keys_being_pressed[]) /**/ {
        // }



    }else if(control_mode == 1) {  // flying mode
    
        if(keys_being_pressed[81]) /*Q*/ {
            camera.position.y += walking_speed / 4;
        }else if(keys_being_pressed[69]) /*E*/ {
            camera.position.y -= walking_speed / 4;
            if(camera.position.y < 2) camera.position.y = 2;
        }
        
        camera.position.z -= walking_speed * Math.cos(camera_rotation_y);
        camera.position.x -= walking_speed * Math.sin(camera_rotation_y);

        if(keys_being_pressed[38]) /* up */ {
            walking_speed += 0.005;
        }else if(keys_being_pressed[40]) /* down */ {
            walking_speed -= 0.005;
            if(walking_speed < 0) walking_speed = 0;
        }

        if(keys_being_pressed[37]) /* left */ {
            camera_rotation_y += 0.02;
            if(camera_rotation_y >= Math.PI * 2) camera_rotation_y -= Math.PI * 2;
        }else if(keys_being_pressed[39]) /* right */ {
            camera_rotation_y -= 0.02;
            if(camera_rotation_y < 0) camera_rotation_y += Math.PI * 2;
        }



    }else if(control_mode == 2) {  // walking mode: up/down only by a slope , no collision
        
        var old_position = camera.position;
        var expected_position = {
            x: old_position.x,
            y: old_position.y,
            z: old_position.z,
        };

        if(keys_being_pressed[87]) /*W*/ {
            expected_position.z -= walking_speed * Math.cos(camera_rotation_y);
            expected_position.x -= walking_speed * Math.sin(camera_rotation_y);
        }else if(keys_being_pressed[83]) /*S*/ {
            expected_position.z += walking_speed * Math.cos(camera_rotation_y);
            expected_position.x += walking_speed * Math.sin(camera_rotation_y);
        }

        if(keys_being_pressed[65]) /*A*/ {
            expected_position.z += walking_speed * Math.sin(camera_rotation_y);
            expected_position.x -= walking_speed * Math.cos(camera_rotation_y);
        }else if(keys_being_pressed[68]) /*D*/ {
            expected_position.z -= walking_speed * Math.sin(camera_rotation_y);
            expected_position.x += walking_speed * Math.cos(camera_rotation_y);
        }

        if(keys_being_pressed[82]) /*R*/ {
            // walking_speed *= 2;
            walking_speed *= 1.0905077;  // 2^(1/8)
        }else if(keys_being_pressed[70]) /*F*/ {
            // walking_speed /= 2;
            walking_speed /= 1.0905077;
        }

        var result_position = movement(old_position , expected_position , 0.5);
        camera.position.x = result_position.x;
        camera.position.y = result_position.y;
        camera.position.z = result_position.z;
    }

    camera_euler = new THREE.Euler(camera_pitching , camera_rotation_y , 0 , 'YXZ')
    camera.setRotationFromEuler(camera_euler);

    // vector_to_camera = (new THREE.Vector3(0 , 0 , camera_distance)).applyEuler(camera_euler);
    // camera.position.set(camera_target.x + vector_to_camera.x , camera_target.y + vector_to_camera.y , camera_target.z + vector_to_camera.z);
    
}
function on_key_down() {
    keys_being_pressed[event.keyCode] = true
    // keys_handle()
}
function on_key_up() {
    keys_being_pressed[event.keyCode] = false
    // console.log('key '+event.keyCode+' up!')
    if(event.keyCode == 77) /*M*/ {
        control_mode += 1;
        if(control_mode >= 3) control_mode = 0;
    }
}
document.body.addEventListener('keydown' , on_key_down);
document.body.addEventListener('keyup' , on_key_up);
setInterval(keys_handle , KEYS_HANDLE_INTERVAL)











function on_mouse_move(event) {
    // console.log(event.clientX , event.clientY)
    // console.log(event)
    
    if(! event.shiftKey) {
        // camera.rotation.y -= event.movementX * 0.002
        // camera.rotation.x -= event.movementY * 0.001

        // camera_rotation_y = camera.rotation.y;



        camera_rotation_y -= event.movementX * 0.002;
        camera_pitching -= event.movementY * 0.001;
        // camera.rotation.x = Math.cos(camera.rotation.y) * camera_pitching;
        // camera.rotation.z = Math.sin(camera.rotation.y) * camera_pitching;
        

        camera_euler = new THREE.Euler(camera_pitching , camera_rotation_y , 0 , 'YXZ')
        camera.setRotationFromEuler(camera_euler);
    }
}
document.addEventListener( 'mousemove', on_mouse_move );



function on_window_resize() {
    renderer.setSize( window.innerWidth - WINDOW_RESERVED_WIDTH , window.innerHeight - WINDOW_RESERVED_HEIGHT );
    // renderer.setViewport(WINDOW_RESERVED_LEFT , WINDOW_RESERVED_UP , window.innerWidth - WINDOW_RESERVED_WIDTH , window.innerHeight - WINDOW_RESERVED_HEIGHT);
    // renderer.setPixelRatio( (window.innerWidth - WINDOW_RESERVED_WIDTH) / (window.innerHeight - WINDOW_RESERVED_HEIGHT) );
    renderer.setPixelRatio( window.devicePixelRatio );
    camera.aspect = (window.innerWidth - WINDOW_RESERVED_WIDTH) / (window.innerHeight - WINDOW_RESERVED_HEIGHT);
    camera.updateProjectionMatrix();
    
    // shader_pass.uniforms['resolution'].value.set( window.innerWidth - WINDOW_RESERVED_WIDTH , window.innerHeight - WINDOW_RESERVED_HEIGHT );
}
window.addEventListener( 'resize', on_window_resize );



var last_updated_time = 0;

var clk = new THREE.Clock();
function animate() {

    // update(clk.getDelta());

    if( clk.getElapsedTime() > last_updated_time + 0.10 ) {
        last_updated_time = clk.getElapsedTime();
        simulator.run_until(last_updated_time);
    }

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    // composer.render();

    document.getElementById('info').innerHTML = 
            // 'camera: target=('+camera_target.x.toFixed(1)+' , '+camera_target.z.toFixed(1)+') , distance='+camera_distance.toFixed(1)+' , '+
            '('+camera.position.x.toFixed(1)+' , '+camera.position.y.toFixed(1)+' , '+camera.position.z.toFixed(1)+') , '+
            'picthing='+(camera_pitching * 180 / Math.PI).toFixed(1)+' deg , direction='+(camera_rotation_y * 180 / Math.PI).toFixed(1)+' deg , '+
            'speed='+(walking_speed * 1000 / KEYS_HANDLE_INTERVAL).toFixed(2)+'m/s='+(walking_speed * 3600 / KEYS_HANDLE_INTERVAL).toFixed(2)+'km/h , '+
            'control mode='+control_mode+';    '+
            // Object.keys(simulator.groups_objects).length+' models (using '+Object.keys(simulator.environment.agents).length+');    '+
            Object.keys(simulator.environment.agents).length+' active / '+simulator.environment.agents_cnt+' agents : reusing '+Object.keys(simulator.groups_objects).length+' 3D models;    '+
            '';
}

animate();

