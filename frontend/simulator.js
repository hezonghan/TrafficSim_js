
import * as THREE from 'three';
import { RectAreaLightHelper } from '../node_modules/three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from '../node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js';

import { PlaneWorldSimpleRoad } from '../core/road.js';
import { SimpleAgentsGenerator } from '../core/agents_generator.js';
import { Environment } from '../core/environment.js';
import { PlaneWorldPositionAndPose , PlaneWorldArc } from '../core/geometry_lib_2d.js';
// import {} from '../core';

class Simulator {

    constructor(scene) {
        this.scene = scene;

        // this.road_data = [
        //     {'initial_lanes_cnt': 3},

        //     // {'add_lane_at': 10},
    
        //     // All events happen on the right side.
        //     // Mileage is measured along the left side.
        //     {'mileage': 1500, 'event_name': 'add_lane'   , 'lanes_cnt': 1},
        //     {'mileage': 1800, 'event_name': 'exit'       , 'lanes_cnt': 1},
        //     {'mileage': 3100, 'event_name': 'entry'      , 'lanes_cnt': 1},
        //     {'mileage': 3400, 'event_name': 'cancel_lane', 'lanes_cnt': 1},
    
        //     {'mileage': 4000, 'event_name': 'change_curvature', 'curvature': +1/1500},
        //     {'mileage': 5000, 'event_name': 'change_curvature', 'curvature': 0},
    
        // ];
        // this.road_data = [
        //     {'initial_lanes_cnt': 3},

        //     {'mileage': 100, 'event_name': 'change_curvature', 'curvature': -1/1000},
        //     {'mileage': 1000, 'event_name': 'change_curvature', 'curvature': 0},
        //     {'mileage': 1500, 'event_name': 'change_curvature', 'curvature': -1/1500},
        //     {'mileage': 2000, 'event_name': 'change_curvature', 'curvature': 0},
        //     {'mileage': 2500, 'event_name': 'cancel_lane', 'lanes_cnt': 1},
        // ];
        this.road_data = [
            {'initial_lanes_cnt': 3},

            {'mileage': 100, 'event_name': 'change_curvature', 'curvature': -1/400},
            {'mileage': 150, 'event_name': 'add_lane'   , 'lanes_cnt': 1},
            {'mileage': 200, 'event_name': 'change_curvature', 'curvature': 0},
            {'mileage': 250, 'event_name': 'exit'       , 'lanes_cnt': 1},
            {'mileage': 300, 'event_name': 'cancel_lane', 'lanes_cnt': 1},

            {'mileage': 500, 'event_name': 'add_lane', 'lanes_cnt': 1},
            {'mileage': 550, 'event_name': 'change_curvature', 'curvature': +1/600},
            {'mileage': 700, 'event_name': 'add_lane', 'lanes_cnt': 1},
        ];
        // this.road_data = [
        //     {'initial_lanes_cnt': 3},
        //     {'mileage': 100, 'event_name': 'change_curvature', 'curvature': +1/600},
        // ];
        // this.road_data = [
        //     {'initial_lanes_cnt': 3},
        // ];

        this.road = new PlaneWorldSimpleRoad(this.road_data);
        
        this.agents_generator = new SimpleAgentsGenerator(this.road);
        this.environment = new Environment(this.road);

        this.environment.connect(this.agents_generator);

        this.interval = 0.1;

        this.groups_objects = {};  // originally named agents_groups
        this.L_lights = {};
        this.R_lights = {};
        this.brake_lights = {};

        this.agent_to_group = {};
        this.group_to_agent = [];
        this.idle_groups = [];

        this.histories = {};

    }

    init_objects() {
        this.scene.add(this.create_road_mesh());
        
        // Assume no agents at the beginning.

        RectAreaLightUniformsLib.init();

        // var light = new THREE.RectAreaLight('red' , 1 , 10 , 10);
        // light.lookAt(0,2,0);
        // this.scene.add(light);
        // this.scene.add(new RectAreaLightHelper(light));
    }

    create_road_mesh() {

        // const LINE_DISTANCE = 10;
        
        const lines_debugging = true;
        
        // var indices;
        var positions = [];
        // var normals;
        // var uvs;

        // var current_position = ;
        // var current_lanes_cnt = response.data.road_data[0].initial_lanes_cnt;
        // for(var road_event_id=1 ; road_event_id < response.data.road_data.length ; road_event_id += 1) {
        //     var road_event = response.data.road_data[road_event_id];

        // }

        var current_arc = new PlaneWorldArc(new PlaneWorldPositionAndPose(0 , 0 , 0) , 0);
        var current_arc_start_mileage = 0;
        var current_event_start_mileage = 0;
        var current_segment_lanes_cnt = this.road_data[0].initial_lanes_cnt;

        for(var road_event_idx=1 ; road_event_idx < this.road_data.length ; road_event_idx += 1) {
            var road_event = this.road_data[road_event_idx];
            
            var LINE_DISTANCE = (current_arc.is_straight() ? road_event.mileage - current_event_start_mileage : 10);
            
            for(var mileage_0 = current_event_start_mileage ; mileage_0 < road_event.mileage ; mileage_0 += LINE_DISTANCE) {
                var mileage_2 = mileage_0 + LINE_DISTANCE;
                var mileage_1 = (mileage_2 >= road_event.mileage ? road_event.mileage : mileage_2);

                var mid_position_and_pose_0 = current_arc.calculate_end_position_and_pose(mileage_0 - current_arc_start_mileage + (lines_debugging ? 0.8 : 0));
                var mid_position_and_pose_1 = current_arc.calculate_end_position_and_pose(mileage_1 - current_arc_start_mileage - (lines_debugging ? 0.8 : 0));

                console.log('road_event_idx='+road_event_idx+' , mileage_0='+mileage_0+' , mileage_1='+mileage_1+' , mileage_2='+mileage_2+' : lane=[0,'+current_segment_lanes_cnt+']');

                for(var lane=0 ; lane<=current_segment_lanes_cnt ; lane += 1) {
                    var position_and_pose_0 = mid_position_and_pose_0.rightward(this.road.lane_width * lane);
                    var position_and_pose_1 = mid_position_and_pose_1.rightward(this.road.lane_width * lane);

                    positions.push(
                        position_and_pose_0.x,
                        0,
                        position_and_pose_0.z,
                        position_and_pose_1.x,
                        0,
                        position_and_pose_1.z,
                    );
                }
            }
            if(road_event.event_name === 'cancel_lane' || road_event.event_name === 'exit') {
                current_segment_lanes_cnt -= road_event.lanes_cnt;

            }else if(road_event.event_name === 'add_lane' || road_event.event_name === 'entry') {
                current_segment_lanes_cnt += road_event.lanes_cnt;
                
            }else if(road_event.event_name === 'change_curvature') {
                current_arc = new PlaneWorldArc(current_arc.calculate_end_position_and_pose(road_event.mileage - current_arc_start_mileage) , road_event.curvature);
                current_arc_start_mileage = road_event.mileage;

            }
            current_event_start_mileage = road_event.mileage;
        }
        console.log(positions);


        var road_geo = new THREE.BufferGeometry();
        // road_geo.setIndex( indices );
        road_geo.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        // road_geo.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
        // road_geo.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

        // var road_mat = new THREE.MeshLambertMaterial({ color: 0xc3c3c3 });
        var road_mat = new THREE.LineBasicMaterial({ color: 'orange' });

        // var road_mesh = new THREE.Mesh(road_geo , road_mat);
        var road_mesh = new THREE.LineSegments(road_geo , road_mat);

        return road_mesh;
    }

    create_agent_mesh() {
        var agent_geo = new THREE.BoxGeometry(3 , 1 , 2);
        var agent_mat = new THREE.MeshLambertMaterial({ color: 'orange' });
        var agent_mesh = new THREE.Mesh(agent_geo , agent_mat);
        agent_mesh.position.set(1.3 , 0.5 , 0);

        var L_light = new THREE.RectAreaLight('yellow',  0 , 0.4 , 0.2);  L_light.position.set(-0.22 , 0.9 , -0.8); L_light.rotation.y = + Math.PI / 2;
        var R_light = new THREE.RectAreaLight('yellow',  0 , 0.4 , 0.2);  R_light.position.set(-0.22 , 0.9 , +0.8); R_light.rotation.y = + Math.PI / 2;
        var brake_light = new THREE.RectAreaLight('red', 0 , 1.2 , 0.2);  brake_light.position.set(-0.22 , 0.9 , 0); brake_light.rotation.y = + Math.PI / 2;

        var agent_group = new THREE.Group();
        agent_group.add(agent_mesh);
        agent_group.add(L_light);
        agent_group.add(R_light);
        agent_group.add(brake_light);

        agent_group.add(new RectAreaLightHelper(L_light));
        agent_group.add(new RectAreaLightHelper(R_light));
        agent_group.add(new RectAreaLightHelper(brake_light));

        return [agent_group , L_light , R_light , brake_light];
    }

    run_until(target_time) {
        // console.log('target_time='+target_time);
        while(this.environment.t < target_time) this.environment.run(this.interval);


        for(var agent_id in this.environment.agents) {

            var agent = this.environment.agents[agent_id];
            if(! agent.active) {

                if(agent_id in this.agent_to_group) {
                    var group_id = this.agent_to_group[agent_id];

                    // delete this.agent_to_group[agent_id];
                    this.group_to_agent[group_id] = -1;
                    this.idle_groups.push(group_id);

                    this.groups_objects[group_id].visible = false;
                }

                this.histories[agent_id] = this.environment.agents[agent_id].track_history;

                continue;
            }

            // if(!(agent_id in this.groups_objects)) {
            if(!(agent_id in this.agent_to_group)) {

                if(this.idle_groups.length == 0) {  // no idle groups left, so need to create a new one.

                    // register
                    this.group_to_agent.push(-1);
                    var new_group_id = this.group_to_agent.length - 1;
                    this.idle_groups.push(new_group_id);

                    // create
                    var production = this.create_agent_mesh();

                    this.groups_objects[new_group_id] = production[0];
                    this.scene.add(production[0]);
                    production[0].visible = false;

                    this.L_lights[new_group_id] = production[1];
                    this.R_lights[new_group_id] = production[2];
                    this.brake_lights[new_group_id] = production[3];
                }

                // bind
                var group_id = this.idle_groups.pop();
                this.group_to_agent[group_id] = agent_id;
                this.agent_to_group[agent_id] = group_id;
                this.groups_objects[group_id].visible = true;
            }

            var group_id = this.agent_to_group[agent_id];

            this.groups_objects[group_id].position.set(
                agent.position_and_pose.x,
                0,
                agent.position_and_pose.z,
            );
            this.groups_objects[group_id].rotation.y = - agent.position_and_pose.direction_rad;

            this.L_lights[group_id].intensity     = (agent.signal_lights.is_left_on() ? 1 : 0);
            this.R_lights[group_id].intensity     = (agent.signal_lights.is_right_on() ? 1 : 0);
            this.brake_lights[group_id].intensity = (agent.signal_lights.is_brake_on() ? 1 : 0);

        }

        this.environment.delete_inactive_agents();

        if(Object.keys(this.histories).length > 100) {
            console.log('histories:');
            console.log(this.histories);
        }
    }
}

export { Simulator };
