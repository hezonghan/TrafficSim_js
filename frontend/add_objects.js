
import * as THREE from 'three';
// import Axios from 'axios';

// import { RectAreaLightHelper } from '../node_modules/three/examples/jsm/helpers/RectAreaLightHelper.js';
// import { RectAreaLightUniformsLib } from '../node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js';


function add_objects(scene) {
    

    var amb_light = new THREE.AmbientLight('white' , 0.5);  // needs to enable physicallyCorrectLights
    scene.add(amb_light);
    
    var dir_light_1 = new THREE.DirectionalLight('white' , 1.0);
    dir_light_1.position.set(-100, 200, +300);
    scene.add(dir_light_1);


    // ______________________
    // sky box
    var sky_geo = new THREE.SphereGeometry(10000);
    var sky_mat = new THREE.MeshBasicMaterial({color: '#a0ffff' , side: THREE.BackSide});
    var sky_mesh = new THREE.Mesh(sky_geo , sky_mat);
    scene.add(sky_mesh);

}

function movement(old_position , expected_position , min_distance_from_wall) {

    // console.log('\nMovement from ('+old_position.x+' , '+old_position.y+' , '+old_position.z+') to ('+expected_position.x+' , '+expected_position.y+' , '+expected_position.z+').');

    var expected_vector = {
        dx: expected_position.x - old_position.x,
        dy: expected_position.y - old_position.y,
        dz: expected_position.z - old_position.z,
    };
    var expected_vector_xz_length = Math.sqrt(expected_vector.dx * expected_vector.dx + expected_vector.dz * expected_vector.dz);

    return expected_position;
}

export { add_objects , movement };

