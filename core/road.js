
import { PlaneWorldPositionAndPose , PlaneWorldArc } from './geometry_lib_2d.js';

class Road {

    constructor() {}

    complete_position_and_pose(incomplete_new_position_and_pose) {
        return incomplete_new_position_and_pose;
    }

}

class PlaneWorldSimpleRoad extends Road {
    
    constructor(road_data , lane_width=3.75) {  // https://baijiahao.baidu.com/s?id=1722403710037648549
        super();

        this.road_data = road_data;
        this.lane_width = lane_width;

        this.init_analyze_entries_and_destinations();
        this.init_analyze_shape();
    }

    init_analyze_entries_and_destinations() {
        this.entries = [];
        this.destinations = [];
        this.segments = [];  // a segment has a constant number of lanes.
        this.arcs = [];  // an arc has a constant curvature.

        var current_lanes_cnt = 0;
        var current_segment_start_mileage = 0;

        // var current_mileage = 0;
        // var current_position_and_pose = 
        var current_arc = new PlaneWorldArc(new PlaneWorldPositionAndPose(0, 0, 0) , 0);
        var current_arc_start_mileage = 0;


        if(!('initial_lanes_cnt' in this.road_data[0])) {
            throw 'Invalid road_data: road_data[0] should contain initial_lanes_cnt.';
        }
        for(var i=0 ; i < this.road_data[0].initial_lanes_cnt ; i+=1) {
            current_lanes_cnt += 1
            this.entries.push({
                'mileage': 0,
                'lane': current_lanes_cnt - 0.5,
                'position_and_pose': current_arc.start_position_and_pose.rightward(this.lane_width * (current_lanes_cnt - 0.5)),
            });
        }


        for(var road_event_idx=1 ; road_event_idx < this.road_data.length ; road_event_idx += 1) {
            var road_event = this.road_data[road_event_idx];

            if(!('event_name' in road_event)) {
                throw 'Invalid road_data: road_data['+road_event_idx+'] should contain event_name.';

            // }else if(road_event.event_name === 'add_lane') {
            //     current_lanes_cnt += road_event.lanes_cnt;

            // }else if(road_event.event_name === 'cancel_lane') {
            //     current_lanes_cnt -= road_event.lanes_cnt;
            //     if(current_lanes_cnt <= 0) throw 'Invalid road_data: road_data['+road_event_idx+'] cancels lanes so no lanes left.';

            }else if(road_event.event_name === 'cancel_lane' || road_event.event_name === 'exit') {
                // current_lanes_cnt -= road_event.lanes_cnt;

                var new_lanes_cnt = current_lanes_cnt - road_event.lanes_cnt;
                var new_segment_start_mileage = road_event.mileage;
                this.segments.push({
                    'start_mileage': current_segment_start_mileage,
                    'segment_length': new_segment_start_mileage - current_segment_start_mileage,
                    'lanes_cnt': current_lanes_cnt,
                });
                current_lanes_cnt = new_lanes_cnt;
                current_segment_start_mileage = new_segment_start_mileage;


                if(road_event.event_name === 'cancel_lane') {
                    if(current_lanes_cnt <= 0) throw 'Invalid road_data: road_data['+road_event_idx+'] cancels lanes so no lanes left.';
                }else {
                    if(current_lanes_cnt <= 0) throw 'Invalid road_data: road_data['+road_event_idx+'] creates exit so no lanes left.';
                }
                

                if(road_event.event_name === 'exit') {
                    var disappeared_lanes = [];
                    for(var disappeared_lane = current_lanes_cnt + road_event.lanes_cnt - 0.5 ; disappeared_lane >= current_lanes_cnt ; disappeared_lane -= 1) {
                        disappeared_lanes.push({
                            'lane': disappeared_lane,
                            'position_and_pose': current_arc
                                                    .calculate_end_position_and_pose(road_event.mileage - current_arc_start_mileage)
                                                    .rightward(this.lane_width * disappeared_lane),
                        });
                    }

                    this.destinations.push({
                        'mileage': road_event.mileage,
                        'lanes': disappeared_lanes,
                    });
                }

            }else if(road_event.event_name === 'add_lane' || road_event.event_name === 'entry') {
                // current_lanes_cnt += road_event.lanes_cnt;
                
                var new_lanes_cnt = current_lanes_cnt + road_event.lanes_cnt;
                var new_segment_start_mileage = road_event.mileage;
                this.segments.push({
                    'start_mileage': current_segment_start_mileage,
                    'segment_length': new_segment_start_mileage - current_segment_start_mileage,
                    'lanes_cnt': current_lanes_cnt,
                });
                current_lanes_cnt = new_lanes_cnt;
                current_segment_start_mileage = new_segment_start_mileage;


                if(road_event.event_name === 'entry') {
                    for(var appeared_lane = current_lanes_cnt - road_event.lanes_cnt + 0.5 ; appeared_lane <= current_lanes_cnt ; appeared_lane += 1) {
                        this.entries.push({
                            'mileage': road_event.mileage,
                            'lane': appeared_lane,
                            'position_and_pose': current_arc
                                                    .calculate_end_position_and_pose(road_event.mileage - current_arc_start_mileage)
                                                    .rightward(this.lane_width * appeared_lane),
                        });
                    }
                }

            }else if(road_event.event_name === 'change_curvature') {

                var new_arc_start_mileage = road_event.mileage;
                // var new_position_and_pose = 
                var new_arc = new PlaneWorldArc(current_arc.calculate_end_position_and_pose(new_arc_start_mileage - current_arc_start_mileage) , road_event.curvature);

                this.arcs.push({
                    'start_mileage': current_arc_start_mileage,
                    'arc_length': new_arc_start_mileage - current_arc_start_mileage,
                    'arc': current_arc,
                });

                current_arc_start_mileage = new_arc_start_mileage;
                current_arc = new_arc;

            // }else if(road_event.event_name === 'add_lane') {
            }else {
                throw 'Invalid road_data: Unrecognized event name "'+road_event.event_name+'" in road_data['+road_event_idx+'].';
            }
        }

        this.total_mileage = this.road_data[this.road_data.length-1].mileage;
        this.segments.push({
            'start_mileage': current_segment_start_mileage,
            'segment_length': this.total_mileage - current_segment_start_mileage,
            'lanes_cnt': current_lanes_cnt,
        });
        this.arcs.push({
            'start_mileage': current_arc_start_mileage,
            'arc_length': this.total_mileage - current_arc_start_mileage,
            'arc': current_arc,
        });

        var remaining_lanes = [];
        for(var remaining_lane = current_lanes_cnt - 0.5 ; remaining_lane >= 0 ; remaining_lane -= 1) {
            remaining_lanes.push({
                'lane': remaining_lane,
                'position_and_pose': current_arc
                                        .calculate_end_position_and_pose(this.total_mileage - current_arc_start_mileage)
                                        .rightward(this.lane_width * remaining_lane),
            });
        }
        this.destinations.push({
            'mileage': this.total_mileage,
            'lanes': remaining_lanes,
        });

        console.log(this.entries);
        console.log(this.destinations);
        console.log(this.segments);
        console.log(this.arcs);
    }

    init_analyze_shape() {

    }
    
    complete_position_and_pose(incomplete_new_position_and_pose) {
        // var min_rightward = null;
        var matched_arc_id = -1;
        var matched_nearest = null;
        // console.log('\ncomplete_position_and_pose():\nincomplete_pp='+JSON.stringify(incomplete_new_position_and_pose));

        // for(var arc_id = 0 ; arc_id < this.arcs.length ; arc_id += 1) {
        //     var arc = this.arcs[arc_id];
        //     var nearest = arc.arc.find_nearest_point_on_arc(incomplete_new_position_and_pose , -0.002);
        //     // console.log('arc_id='+arc_id+' : nearest=');
        //     // console.log(nearest);
        //     console.log('\n\tarc_id='+arc_id+'\n\tarc='+JSON.stringify(arc)+'\n\tnearest='+JSON.stringify(nearest));
        //
        //     if(nearest.arc_length < 0) continue;
        //     if(arc_id != this.arcs.length-1 && nearest.arc_length >= arc.arc_length) continue;  // if finished total_mileage, arc_id points to the final arc.
        //     if(nearest.rightward < 0.1) continue;
        //
        //     if(matched_arc_id == -1 || nearest.rightward < matched_nearest.rightward) {
        //         matched_arc_id = arc_id;
        //         matched_nearest = nearest;
        //     }
        // }
        // if(matched_arc_id == -1) {
        //     // throw 'No arc matched: x='+incomplete_new_position_and_pose.x+' , z='+incomplete_new_position_and_pose.z;
        //     incomplete_new_position_and_pose.arc_id = -1;
        //     return incomplete_new_position_and_pose;
        // }
        
        for(var arc_id = 0 ; arc_id < this.arcs.length ; arc_id += 1) {
            var arc = this.arcs[arc_id];
            var nearest = arc.arc.find_nearest_point_on_bounded_arc(incomplete_new_position_and_pose , 0 , arc.arc_length);

            if(matched_arc_id == -1 || nearest.bounded.distance < matched_nearest.bounded.distance) {
                matched_arc_id = arc_id;
                matched_nearest = nearest;
            }
        }

        // console.log('matched_arc_id='+matched_arc_id);
        incomplete_new_position_and_pose.mileage = this.arcs[matched_arc_id].start_mileage + matched_nearest.unbounded.arc_length;
        incomplete_new_position_and_pose.lane = matched_nearest.unbounded.rightward / this.lane_width;
        incomplete_new_position_and_pose.deviation_rad = matched_nearest.unbounded.deviation_rad;
        incomplete_new_position_and_pose.arc_id = matched_arc_id;

        for(var segment_id = 0 ; segment_id < this.segments.length ; segment_id += 1) {
            var segment = this.segments[segment_id];
            if(
                incomplete_new_position_and_pose.mileage >= segment.start_mileage && 
                incomplete_new_position_and_pose.mileage <= segment.start_mileage + segment.segment_length
            ) {
                incomplete_new_position_and_pose.segment_id = segment_id;
                break;
            }
        }

        return incomplete_new_position_and_pose;
    }
}

export { Road , PlaneWorldSimpleRoad };
