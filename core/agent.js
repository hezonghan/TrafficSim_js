
import { PlaneWorldArc } from './geometry_lib_2d.js';

class Agent {

    constructor(agent_id , environment) {
        this.agent_id = agent_id;
        this.environment = environment;
        this.active = true;
    }

    decide(interval) {
        if(! this.active) return;
    }

    execute(interval) {
        if(! this.active) return;
    }

}

class PlaneWorldAgent extends Agent {

    constructor(
        agent_id , environment , 
        initial_position_and_pose , initial_linear_speed=0 , initial_linear_acceleration=0 , initial_curvature=0 , 
    ) {
        super(agent_id , environment);

        this.position_and_pose = initial_position_and_pose;  // at least contains:  x , z , direction_rad
        this.position_and_pose = this.environment.road.complete_position_and_pose(this.position_and_pose);

        this.linear_speed = initial_linear_speed;
        this.linear_acceleration = initial_linear_acceleration;
        this.curvature = initial_curvature;
        // this.turning = {
        //     'direction': 'straight',
        // }
    }
    
    decide(interval) {
        if(! this.active) return;

        // this.acceleration = 
        // this.curvature = 
    }

    execute(interval) {
        if(! this.active) return;

        var old_linear_speed = this.linear_speed;
        this.linear_speed += this.linear_acceleration * interval;

        var average_linear_speed = (old_linear_speed + this.linear_speed) / 2;
        var movement = average_linear_speed * interval;
        
        // console.log('execute()\'1 : agent_id='+this.agent_id+' , t='+this.environment.t+' , x='+this.position_and_pose.x+' , z='+this.position_and_pose.z+' , old_linear_speed='+old_linear_speed+' , '+this.linear_speed+' , curvature='+this.curvature+' , lane='+this.position_and_pose.lane);

        var arc = new PlaneWorldArc(this.position_and_pose , this.curvature);
        var incomplete_new_position_and_pose = arc.calculate_end_position_and_pose(movement);

        this.position_and_pose = this.environment.road.complete_position_and_pose(incomplete_new_position_and_pose);
        // console.log('execute()\'2 : agent_id='+this.agent_id+' , t='+this.environment.t+' , x='+this.position_and_pose.x+' , z='+this.position_and_pose.z+' , lane='+this.position_and_pose.lane+' , segment_id='+this.position_and_pose.segment_id);
        // if(this.position_and_pose.arc_id == -1) throw 'execute()\'2 : agent_id='+this.agent_id+' : no arc matched.';
    }

}

class PlaneWorldAimedAgent extends PlaneWorldAgent {
    
    // based on PlaneWorldSimpleRoad, so:
    
        // can identify collision with left/right side of road (simple: lane-based).
        // can identify collision with left/right side of road (precise).  [TODO]
        // can identify finish at exit.
        // can identify finish at the end of road.
        // can identify having already missed the destination exit.
        // can identify going to miss the destination exit.  [TODO]

        // can sharply brake if collision happens.
        // can become inactive if finished.
        // can modify destination if missing original destination.


        // can identify disappeared lanes on the right
        // can identify destination

        // can go along a lane
        // can switch lanes to
            // avoid disappeared lanes on the right
            // prepare to exit at destination
            

    // ignore other agents, so:
        // cannot identify collision between agents.
        // cannot control linear acceleration nor speed (except sharply brake after collision).
        // cannot control lights signals.


    constructor(
        agent_id , environment , 
        initial_destination , 
        initial_position_and_pose , initial_linear_speed=0 , initial_linear_acceleration=0 , initial_curvature=0 , 
    ) {
        super(agent_id , environment , initial_position_and_pose , initial_linear_speed , initial_linear_acceleration , initial_curvature);
        this.destination = initial_destination;

        // this.lane_based_collision_threshold = 0.5 / this.environment.road.road_width;
        this.lane_based_collision_threshold = 0.5 / this.environment.road.lane_width;

        this.collision_time = -1;

        this.track_history = {
            mileage: [],
            lane: [],
        };
    }

    // decide() should control : curvature , linear_acceleration , collision_time
    decide(interval) {
        if(! this.active) return;

        try {

        if(this.simple_collision_with_road_identify()) {
            this.simple_response_after_collision();
            return;
        }
        }catch(err) {
            throw 'agent_id='+this.agent_id+' , pp='+JSON.stringify(this.position_and_pose)+'\n\n'+err.message+'\n\n'+err.stack;
        }


        var destination_details = this.environment.road.destinations[this.destination];
        if(this.position_and_pose.mileage > destination_details.mileage) this.destination += 1;  // modify to next destination.
        // Note: the last destination is the end of road, so don't worry the modified destination becoming out of range.

        
        this.linear_acceleration = 0;

        
        // this.simple_go_along_lane(interval); return;  // "no-switch-lane" experiment : proves that the simple_go_along_lane() is nice.

        // this.switch_lane_to( Math.floor(this.position_and_pose.lane) + 0.5 + 1 , interval); return;
        // this.switch_lane_to( Math.floor(this.position_and_pose.mileage / 400) + 0.5 , interval); return;
        // this.switch_lane_to( Math.floor(this.position_and_pose.lane) + 0.5 , interval); return;

        var r1 = this.relative_position_to_next_disappeared_lane();
        var r2 = this.relative_position_to_destination();
        if(
                r1 != null && r1.remaining_lane < 0 && r1.ratio_abs < 200
                && (r2 == null || r1.remaining_mileage < r2.remaining_mileage)
            ) {
            // console.log('agent_id='+this.agent_id+'\npp='+JSON.stringify(this.position_and_pose)+'\nr1='+JSON.stringify(r1));
            // Switch leftward to avoid disappeared lanes on the right.
            this.switch_lane_to(r1.target_lane , interval);

        }else {
            if( r2 != null && r2.remaining_lane > 0.1 && r2.ratio_abs < 200 ) {
                // Want to switch rightward to prepare to exit.
                var target_lane = Math.min(r2.target_lane , this.environment.road.segments[this.position_and_pose.segment_id].lanes_cnt - 0.5);
                this.switch_lane_to(target_lane , interval);

            }else {
                // Otherwise, go along current lane.

                // this.simple_go_along_lane(interval);  // see  /experiments/2023_0130_02/2023_0130_2349.svg
                this.switch_lane_to( Math.floor(this.position_and_pose.lane) + 0.5 , interval );  // see  /experiments/2023_0130_02/2023_0130_2341.svg
            }
        }

    }

    simple_collision_with_road_identify() {
        // if(this.position_and_pose.arc_id != -1)
        //     if(
        //         this.position_and_pose.lane > 2.8 || 
        //         this.position_and_pose.segment_id != 0 ||
        //         this.environment.road.segments[this.position_and_pose.segment_id].lanes_cnt != 3
        //         )
        //         throw 'simple_collision_with_road_identify() : agent_id='+this.agent_id+' , t='+this.environment.t+' , x='+this.position_and_pose.x+' , z='+this.position_and_pose.z+' , mileage='+this.position_and_pose.mileage+' , lane='+this.position_and_pose.lane+' , segment_id='+this.position_and_pose.segment_id+' , direction_rad='+this.position_and_pose.direction_rad+' , arc_id='+this.position_and_pose.arc_id;
        return (
            this.collision_time >= 0 || 
            this.position_and_pose.arc_id == -1 || 
            this.position_and_pose.lane < this.lane_based_collision_threshold || 
            this.position_and_pose.lane > this.environment.road.segments[this.position_and_pose.segment_id].lanes_cnt - this.lane_based_collision_threshold  // including the case of collision with exit corner.
        );
    }

    simple_response_after_collision() {

        this.curvature = 0;

        if(this.linear_speed > 1) {
            this.linear_acceleration = -12;

        }else if(this.linear_speed > 0) {
            this.linear_acceleration = -4;

        }else {
            this.linear_acceleration = 0;
            this.linear_speed = 0;

        }

        if(this.collision_time < 0) {
            this.collision_time = this.environment.t;
            console.log('Agent #'+this.agent_id+' collides at time '+this.collision_time+' s.\n\npp='+JSON.stringify(this.position_and_pose));
        }
    }

    relative_position_to_destination() {
        var destination_details = this.environment.road.destinations[this.destination];
        var target_lane_details = destination_details.lanes[destination_details.lanes.length - 1];
        var relative = {
            'remaining_mileage': destination_details.mileage - this.position_and_pose.mileage,
            'remaining_lane':    target_lane_details.lane - this.position_and_pose.lane,
            'target_lane': target_lane_details.lane,
        };
        relative.ratio_abs = relative.remaining_mileage / relative.remaining_lane;
        return relative;
    }

    relative_position_to_next_disappeared_lane() {
        var current_segment_id = this.position_and_pose.segment_id;
        // console.log('agent_id='+this.agent_id+' , t='+this.environment.t+' , x='+this.position_and_pose.x+' , z='+this.position_and_pose.z+' , mileage='+this.position_and_pose.mileage+' , segment_id='+this.position_and_pose.segment_id);
        var current_segment = this.environment.road.segments[current_segment_id];

        // var min_lanes_cnt = current_segment.lanes_cnt;
        var min_target_lane = this.position_and_pose.lane;
        // var focused_segment_id = -1;
        // var focused_ratio = -1;
        var focused_relative = null;
        for(var later_segment_id = current_segment_id + 1 ; later_segment_id < this.environment.road.segments.length ; later_segment_id += 1) {
            var later_segment = this.environment.road.segments[later_segment_id];
            
            var later_relative = {
                // 'segment_id': later_segment_id,
                'remaining_mileage': later_segment.start_mileage - this.position_and_pose.mileage,
                'remaining_lane':    (later_segment.lanes_cnt - 0.5) - this.position_and_pose.lane,
                'target_lane': (later_segment.lanes_cnt - 0.5),
            }
            later_relative.ratio_abs = later_relative.remaining_mileage / (-later_relative.remaining_lane);

            if(later_relative.remaining_mileage > 800) break;  // too far, cannot see

            // if(later_segment.lanes_cnt >= min_lanes_cnt) continue;
            // min_lanes_cnt = later_segment.lanes_cnt;
            if(later_relative.target_lane >= min_target_lane) continue;
            min_target_lane = later_relative.target_lane;

            if(focused_relative == null || later_relative.ratio_abs < focused_relative.ratio_abs) focused_relative = later_relative;
        }
        return focused_relative;
    }

    simple_go_along_lane(interval) {
        // var turning_angle_rad = Math.atan(3.0 * this.curvature);
        // turning_angle_rad -= this.position_and_pose.deviation_rad / 0.5 * interval;
        // this.curvature = Math.tan(turning_angle_rad) / 3.0;

        this.curvature -= this.position_and_pose.deviation_rad / 0.20 * interval;  // tan(x) \approx x   for   x \approx 0   so we can remove tangents.
        // According to "/experiments/2023_0130_01_go_along_lane"
        // which is conducted under the #3 road_data with total mileage of 700m and minimum turning radius of 400m, with lane_width of 3.75m,
        // coefficient 0.20 is good enough, with lane vibrates within 0.017   * lane_width < 6.4cm.
        // Although    0.10 is better,      with lane vibrates within 0.00765 * lane_width < 2.9cm, it is not used because
        //             0.08 will cause severe rotations of agents.

        // turning radius of 400m is small enough for an express-way, see  https://www.zhihu.com/question/272270344

        // console.log('simple_go_along_lane() : position_and_pose.deviation_rad='+this.position_and_pose.deviation_rad+' , curvature='+this.curvature+' , interval='+interval);
    }

    switch_lane_to(target_lane , interval) {

        // const SWITCHING_LANE_deviation_rad = 8 / 180 * Math.PI;
        // const SWITCHING_LANE_deviation_rad = 2 / 180 * Math.PI;

        const SWITCHING_LANE_ahead_mileage = 100;
        const SWITCHING_LANE_deviation_rad = Math.atan(this.environment.road.lane_width / SWITCHING_LANE_ahead_mileage);

        var current_lane = this.position_and_pose.lane;

        // var expected_deviation_rad = SWITCHING_LANE_deviation_rad * (target_lane - current_lane) / 0.5;
        // if(expected_deviation_rad > +SWITCHING_LANE_deviation_rad) expected_deviation_rad = +SWITCHING_LANE_deviation_rad;
        // if(expected_deviation_rad < -SWITCHING_LANE_deviation_rad) expected_deviation_rad = -SWITCHING_LANE_deviation_rad;

        var expected_deviation_rad = 0;
        if(target_lane - current_lane > +0.1) expected_deviation_rad = +SWITCHING_LANE_deviation_rad;
        if(target_lane - current_lane < -0.1) expected_deviation_rad = -SWITCHING_LANE_deviation_rad;

        // -------------
        // x as deviation_diff , f(x) as curvature_delta

        // f(x) = k1 * x
        // const k1 = 1 / 8.00 * interval;
        // this.curvature -= (this.position_and_pose.deviation_rad - expected_deviation_rad) * k1;

        // f(x) = k1 * x = k2 * log(x + 1)  @ x=x0   ==> k2 = k1 * x0 / log(x0 + 1)
        // const diff_0 = 8 / 180 * Math.PI;
        // const k2 = k1 * diff_0 / Math.log(diff_0 + 1);
        // this.curvature -= Math.log(this.position_and_pose.deviation_rad - expected_deviation_rad + 1) * k2;

        // const k3 = 1 / 0.10 * interval;
        // this.curvature -= (this.position_and_pose.deviation_rad - expected_deviation_rad) * Math.abs(this.position_and_pose.deviation_rad - expected_deviation_rad) * k3;

        var deviation_rad_diff = this.position_and_pose.deviation_rad - expected_deviation_rad;
        // var deviation_rad_diff_abs = Math.abs(deviation_rad_diff);
        // var deviation_rad_diff_sgn = Math.sign(deviation_rad_diff);

        // if(deviation_rad_diff_abs > 0) {
        //     const X_WHEN_FY_HALF = SWITCHING_LANE_deviation_rad / 6;
        //     const FY_WHEN_X_0 = 0.01;
        //     const MAX_CURVATURE_CHANGE = 1 / 400 * interval;

        //     const X_WHEN_Y_0 = X_WHEN_FY_HALF;
        //     const Y_WHEN_X_0 = Math.tan((FY_WHEN_X_0 - 0.5) * Math.PI);

        //     var x_abs = deviation_rad_diff_abs;
        //     var y_abs = (- Y_WHEN_X_0 / X_WHEN_Y_0) * x_abs + Y_WHEN_X_0;
        //     var fy_abs = Math.atan(y_abs) / Math.PI + 0.5;  // falls into (0,1)
        //     this.curvature -= fy_abs * deviation_rad_diff_sgn * MAX_CURVATURE_CHANGE;
        // }

        // Failed.

        // Proved impossible to "adjust" rather than "assign" curvature value: 
            // Curvature is the first derivative of direction (deviation), 
            // so the "adjustment" of curvature is the second derivative of direction (deviation).
            // Therefore it's hard to adjust the curvation during switching lanes.

        // -------------
        
        // lane (horizontal position) : in-lane adjustment , lanes switching
        // deviation
        // road curvature
        // self curvature

        this.curvature = -0.10 * deviation_rad_diff;  // 0.10 is good , see "/experiments/2023_0130_03_switch_lane"

        // console.log('switch_lane_to() : agent_id='+this.agent_id+' ,\n current_lane='+current_lane+' ,\n target_lane='+target_lane+' ,\n expected_deviation_rad='+expected_deviation_rad+' ,\n position_and_pose.deviation_rad='+this.position_and_pose.deviation_rad+' ,\n curvature='+this.curvature+' (turning_radius='+(1/this.curvature)+' , turning_angle='+(Math.atan(this.curvature * 3) / Math.PI * 180)+'deg) ,\n ');
    }

    execute(interval) {
        if(! this.active) return;  // necessary even if super.execute is called, because super.execute only "returns" to here.

        super.execute(interval);
        this.track_history.mileage.push(this.position_and_pose.mileage);
        this.track_history.lane.push(this.position_and_pose.lane);

        // finish at the destination exit
        var destination_details = this.environment.road.destinations[this.destination]
        if(
            this.position_and_pose.mileage > destination_details.mileage && 
            this.position_and_pose.lane <= destination_details.lanes[0                                 ].lane + 0.5 - this.lane_based_collision_threshold &&
            this.position_and_pose.lane >= destination_details.lanes[destination_details.lanes.length-1].lane - 0.5 + this.lane_based_collision_threshold
        ) {
            this.active = false;
            console.log('Agent #'+this.agent_id+' finishes at destination #'+this.destination+' (mileage='+this.position_and_pose.mileage+' , lane='+this.position_and_pose.lane+') at time '+this.environment.t+' s.\n\npp='+JSON.stringify(this.position_and_pose));
        }else {


            // finish at the end of road
            if(this.position_and_pose.mileage > this.environment.road.total_mileage) {
                this.active = false;  // maybe missing destination
                console.log('Agent #'+this.agent_id+' finishes at the end of road (mileage='+this.position_and_pose.mileage+' , lane='+this.position_and_pose.lane+') at time '+this.environment.t+' s.\n\npp='+JSON.stringify(this.position_and_pose));
            }


        }

        // collision happened before 60 seconds ago.
        if(this.collision_time >= 0 && this.environment.t - this.collision_time > 60) this.active = false;
    }

}

class SimpleSignalLights {

    constructor(agent , flashing_interval = 1) {
        this.agent = agent;
        this.environment = agent.environment;
        this.flashing_interval = flashing_interval;

        this.L_light_start_time = -1;
        this.R_light_start_time = -1;
        this.LR_lights_state = 0;
    }

    left() {
        if(this.LR_lights_state == 1) return;
        this.LR_lights_state = 1;
        this.L_light_start_time = this.environment.t;
        this.R_light_start_time = -1;
    }
    right() {
        if(this.LR_lights_state == 2) return;
        this.LR_lights_state = 2;
        this.L_light_start_time = -1;
        this.R_light_start_time = this.environment.t;
    }
    double() {
        if(this.LR_lights_state == 3) return;
        this.LR_lights_state = 3;
        this.L_light_start_time = this.environment.t;
        this.R_light_start_time = this.environment.t;
    }
    cancel() {
        if(this.LR_lights_state == 0) return;
        this.LR_lights_state = 0;
        this.L_light_start_time = -1;
        this.R_light_start_time = -1;
    }

    is_left_on()  { return (this.L_light_start_time >= 0 && ((this.environment.t - this.L_light_start_time) / this.flashing_interval) % 1 < 0.5 ); }
    is_right_on() { return (this.R_light_start_time >= 0 && ((this.environment.t - this.R_light_start_time) / this.flashing_interval) % 1 < 0.5 ); }
    is_brake_on() { return (this.agent.linear_acceleration < -1e-5); }

    decide(action_fn) {
        this.action_fn = action_fn;
    }
    execute() {
        if(this.action_fn == null) return;
        this.action_fn();
        this.action_fn = null;
    }

}

class InteractiveAgent extends PlaneWorldAimedAgent {
    
    constructor(
        agent_id , environment , 
        initial_destination , 
        initial_position_and_pose , initial_linear_speed=0 , initial_linear_acceleration=0 , initial_curvature=0 , 
    ) {
        super(agent_id , environment , initial_destination , initial_position_and_pose , initial_linear_speed , initial_linear_acceleration , initial_curvature);

        this.signal_lights = new SimpleSignalLights(this);
    }

    decide(interval) {
        if(! this.active) return;  // necessary even if super.decide is called, because super.decide only "returns" to here.

        // super.decide(interval);


        if(this.simple_collision_with_road_identify() || this.simple_collision_with_agents_identify()) {
            this.simple_response_after_collision();
            return;
        }



        while(this.position_and_pose.mileage > this.environment.road.destinations[this.destination].mileage) this.destination += 1;  // modify to next destination.
        // Note: the last destination is the end of road, so don't worry the modified destination becoming out of range.



        var r1 = this.relative_position_to_next_disappeared_lane();
        var r2 = this.relative_position_to_destination();
        var sorted_agent_pos_range = this.environment.calculate_nearby_agents(this.position_and_pose.mileage - 50 , this.position_and_pose.mileage + 400);


        var target_lane = null;
        if(
            r1 != null && r1.remaining_lane < 0 && r1.ratio_abs < 200
            && (r2 == null || r1.remaining_mileage < r2.remaining_mileage)
        ) {  // Switch leftward to avoid disappeared lanes on the right.
            target_lane = r1.target_lane;

        }else {
            if( r2 != null && r2.remaining_lane > 0.1 && r2.ratio_abs < 200 ) {  // Want to switch rightward to prepare to exit.
                target_lane = Math.min(r2.target_lane , this.environment.road.segments[this.position_and_pose.segment_id].lanes_cnt - 0.5);

            }else {
                target_lane = Math.floor(this.position_and_pose.lane) + 0.5;
            }
        }
        this.switch_lane_to(target_lane , interval);


        // control linear_acceleration
        var same_lane_ahead_nearest_agent_id = -1;
        var same_lane_ahead_nearest_agent_mileage_diff = -1;

        for(var sorted_agent_pos=sorted_agent_pos_range[0] ; sorted_agent_pos <= sorted_agent_pos_range[1] ; sorted_agent_pos += 1) {
            var nearby_agent_id = this.environment.sorted_agents[sorted_agent_pos];
            var nearby_agent = this.environment.agents[nearby_agent_id];

            if(nearby_agent_id == this.agent_id) continue;

            var mileage_diff = nearby_agent.position_and_pose.mileage - this.position_and_pose.mileage;
            var lane_diff    = nearby_agent.position_and_pose.lane    - this.position_and_pose.lane   ;

            if(Math.abs(lane_diff) >= 0.8) continue;
            if(mileage_diff <= 0) continue;

            // var min_lanes_cnt_between_agents = this.position_and_pose.lane;
            var min_lanes_cnt_between_agents = Math.max(this.position_and_pose.lane , nearby_agent.position_and_pose.lane) + 0.01;
            for(var segment_id = this.position_and_pose.segment_id ; segment_id <= nearby_agent.position_and_pose.segment_id ; segment_id += 1) {
                if(this.environment.road.segments[segment_id].lanes_cnt < min_lanes_cnt_between_agents) {
                    min_lanes_cnt_between_agents = this.environment.road.segments[segment_id].lanes_cnt;
                }
            }
            if(Math.max(this.position_and_pose.lane , nearby_agent.position_and_pose.lane) > min_lanes_cnt_between_agents) continue;

            if(same_lane_ahead_nearest_agent_id == -1 || mileage_diff < same_lane_ahead_nearest_agent_mileage_diff) {
                same_lane_ahead_nearest_agent_id = nearby_agent_id;
                same_lane_ahead_nearest_agent_mileage_diff = mileage_diff;
            }

        }



        if(this.linear_speed < 110 / 3.6) {
            this.linear_acceleration = +1.5;
        }else {
            this.linear_acceleration = 0;
        }

        if(same_lane_ahead_nearest_agent_id != -1) {
            var same_lane_ahead_nearest_agent = this.environment.agents[same_lane_ahead_nearest_agent_id];

            var exact_linear_speed_diff = same_lane_ahead_nearest_agent.linear_speed - this.linear_speed;
            var exact_mileage_diff = same_lane_ahead_nearest_agent_mileage_diff;

            var human_percepted_linear_speed_diff = exact_linear_speed_diff;
            var human_percepted_mileage_diff = exact_mileage_diff;

            // this.linear_acceleration = Math.max(0.8 * human_percepted_linear_speed_diff - 0 * human_percepted_mileage_diff, -12);
            // this.linear_acceleration = 6 * human_percepted_linear_speed_diff / human_percepted_mileage_diff;

            // if( 1200-30 <= this.position_and_pose.mileage && this.position_and_pose.mileage <= 1200 && this.position_and_pose.lane > 3 ) console.log('agent_id='+this.agent_id+'\n\tpp='+JSON.stringify(this.position_and_pose)+'\n\tahead pp='+JSON.stringify(same_lane_ahead_nearest_agent.position_and_pose));

            if(human_percepted_linear_speed_diff < 0) {
                if(human_percepted_mileage_diff < 8) {
                    this.linear_acceleration = -12;
                }else {
                    this.linear_acceleration = - human_percepted_linear_speed_diff * human_percepted_linear_speed_diff / (human_percepted_mileage_diff - 8) * 0.5;
                }
            // }else if(human_percepted_mileage_diff < 50) {
            }else if(human_percepted_mileage_diff / this.linear_speed < 2) {
                this.linear_acceleration = -1;
            // }else if(human_percepted_mileage_diff < 100) {
            }else if(human_percepted_mileage_diff / this.linear_speed < 4) {
                this.linear_acceleration = 0;

            }else if(this.linear_speed < 110 / 3.6) {
                this.linear_acceleration = +1.5;
            }else {
                this.linear_acceleration = 0;
            }

        // }else {
        }


        if(this.linear_acceleration < -12) this.linear_acceleration = -12;

        if(this.linear_speed <= 0) {
            this.linear_speed = 0;
            if(this.linear_acceleration < 0) this.linear_acceleration = 0;
        }


        // control curvature
        // control lights
    }

    simple_collision_with_agents_identify() {
        var sorted_agent_pos_range = this.environment.calculate_nearby_agents(this.position_and_pose.mileage - 5 , this.position_and_pose.mileage + 5);
        for(var sorted_agent_pos=sorted_agent_pos_range[0] ; sorted_agent_pos <= sorted_agent_pos_range[1] ; sorted_agent_pos += 1) {
            var nearby_agent_id = this.environment.sorted_agents[sorted_agent_pos];
            var nearby_agent = this.environment.agents[nearby_agent_id];

            if(nearby_agent_id == this.agent_id) continue;

            // if(this.position_and_pose.distance_to(nearby_agent.position_and_pose) < 3) {
            var mileage_diff_abs = Math.abs(this.position_and_pose.mileage - nearby_agent.position_and_pose.mileage);
            var lane_diff_abs    = Math.abs(this.position_and_pose.lane    - nearby_agent.position_and_pose.lane   );
            if(mileage_diff_abs < 3 && lane_diff_abs < 0.6) {
                console.log('Agent #'+this.agent_id+' and #'+nearby_agent.agent_id+' collides:\n\npp='+JSON.stringify(this.position_and_pose)+'\n\npp='+JSON.stringify(nearby_agent.position_and_pose));
                return true;
            }
        }
        return false;
    }

    simple_response_after_collision() {
        if(this.collision_time < 0) this.signal_lights.decide(this.signal_lights.double);
        super.simple_response_after_collision();
    }

    switch_lane_to(target_lane , interval) {
        super.switch_lane_to(target_lane , interval);

        if(target_lane - this.position_and_pose.lane < -0.5) this.signal_lights.decide(this.signal_lights.left); else
        if(target_lane - this.position_and_pose.lane > +0.5) this.signal_lights.decide(this.signal_lights.right); else
        this.signal_lights.decide(this.signal_lights.cancel);
    }

    execute(interval) {
        if(! this.active) return;  // necessary even if super.execute is called, because super.execute only "returns" to here.

        super.execute(interval);
        this.signal_lights.execute();
    }

}

export { Agent , PlaneWorldAgent , PlaneWorldAimedAgent , InteractiveAgent };
