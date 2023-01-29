
import { Simulator } from '../frontend/simulator.js';
// import simulator_pkg from '../frontend/simulator.js'; const { Simulator } = simulator_pkg;
// import * as simulator_pkg from '../frontend/simulator.js'; const { Simulator } = simulator_pkg;
// const { Simulator } = require('../frontend/simulator.js');

import { PlaneWorldPositionAndPose } from '../core/geometry_lib_2d.js';
// import geometry_lib_2d_pkg from '../core/geometry_lib_2d.js'; const { PlaneWorldPositionAndPose , PlaneWorldArc } = geometry_lib_2d_pkg;


var simulator = new Simulator(null);
// var incomplete_position_and_pose = new PlaneWorldPositionAndPose(382.24 , -40 , -0.26899);
var incomplete_position_and_pose = new PlaneWorldPositionAndPose(248 , -11 , -0.353);
simulator.environment.road.complete_position_and_pose(incomplete_position_and_pose);
console.log(incomplete_position_and_pose);
console.log(simulator.environment.road.segments[incomplete_position_and_pose.segment_id].lanes_cnt);
