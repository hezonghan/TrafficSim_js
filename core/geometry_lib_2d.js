
function normalize_direction_rad(theta , min=0) {
    while(theta >= min + 2 * Math.PI) theta -= 2 * Math.PI;
    while(theta <  min              ) theta += 2 * Math.PI;
    return theta;
}

function get_direction_rad(dx , dz) {
    if(Math.abs(dx) < 1e-5) {
        return (dz > 0 ? 90 : 270) / 180 * Math.PI;
    }else {
        var ans = Math.atan(dz / dx);
        if(dx < 0) ans += Math.PI;
        return normalize_direction_rad(ans);
    }
}

class PlaneWorldPositionAndPose {
    
    constructor(x , z , direction_rad) {
        this.x = x;
        this.z = z;
        this.direction_rad = direction_rad;
    }

    ahead(offset) {
        return new PlaneWorldPositionAndPose(
            this.x + offset * Math.cos(this.direction_rad),
            this.z + offset * Math.sin(this.direction_rad),
            this.direction_rad,
        );
    }

    rightward(offset) {
        return new PlaneWorldPositionAndPose(
            this.x + offset * Math.cos(this.direction_rad + 90 / 180 * Math.PI),
            this.z + offset * Math.sin(this.direction_rad + 90 / 180 * Math.PI),
            this.direction_rad,
        );
    }
    
}

class PlaneWorldArc {

    constructor(start_position_and_pose , curvature) {
        this.start_position_and_pose = start_position_and_pose;
        this.curvature = curvature;

        if(! this.is_straight()) {
            this.is_right_turning = (this.curvature > 0);
            this.turning_radius_abs = Math.abs(1 / this.curvature);

            this.angle_0 = this.start_position_and_pose.direction_rad + (this.is_right_turning ? -90 : 90) / 180 * Math.PI;

            this.center_x = this.start_position_and_pose.x - this.turning_radius_abs * Math.cos(this.angle_0);
            this.center_z = this.start_position_and_pose.z - this.turning_radius_abs * Math.sin(this.angle_0);
        }
    }

    is_straight() {
        return (Math.abs(this.curvature) < 1e-5);
    }

    calculate_end_position_and_pose(arc_length) {
        if(this.is_straight()) return this.start_position_and_pose.ahead(arc_length);

        var angle_1 = this.angle_0 + (this.is_right_turning ? 1 : -1) * arc_length / this.turning_radius_abs;
        // console.log('calculate_end_position_and_pose() : angle_0='+this.angle_0+' , angle_1='+angle_1);
        return new PlaneWorldPositionAndPose(
            this.center_x + this.turning_radius_abs * Math.cos(angle_1),
            this.center_z + this.turning_radius_abs * Math.sin(angle_1),
            angle_1 - (this.is_right_turning ? -90 : 90) / 180 * Math.PI,
        );
    }

    find_nearest_point_on_arc(given_position_and_pose , min_arc_angle_rad=0) {
        var dx1 = given_position_and_pose.x - this.start_position_and_pose.x;
        var dz1 = given_position_and_pose.z - this.start_position_and_pose.z;

        var dx2 = Math.cos(this.start_position_and_pose.direction_rad);
        var dz2 = Math.sin(this.start_position_and_pose.direction_rad);

        var dot_product_1_2 = dx1 * dx2 + dz1 * dz2;
        var cross_product_1_2 = dx1 * dz2 - dz1 * dx2;

        if(this.is_straight()) {
            var nearest_position_and_pose = this.start_position_and_pose.ahead(dot_product_1_2);
            return {
                'arc_length': dot_product_1_2,
                'nearest_position_and_pose': nearest_position_and_pose,

                'rightward': - cross_product_1_2,
                'deviation_rad': normalize_direction_rad(given_position_and_pose.direction_rad - nearest_position_and_pose.direction_rad , -Math.PI),
            };
        }else {
            var dx3 = given_position_and_pose.x - this.center_x;
            var dz3 = given_position_and_pose.z - this.center_z;
            var len3 = Math.sqrt(dx3 * dx3 + dz3 * dz3);
            var direction_rad_3 = get_direction_rad(dx3 , dz3);

            var arc_angle_rad = (direction_rad_3 - this.angle_0) * (this.curvature > 0 ? 1 : -1);
            arc_angle_rad = normalize_direction_rad(arc_angle_rad , min_arc_angle_rad);
            var arc_length = arc_angle_rad * this.turning_radius_abs;

            // var nearest_position_and_pose = this.start_position_and_pose.ahead(arc_length);
            var nearest_position_and_pose = this.calculate_end_position_and_pose(arc_length);
            return {
                'arc_length': arc_length,
                'nearest_position_and_pose': nearest_position_and_pose,
                'rightward': (this.turning_radius_abs - len3) * (this.curvature > 0 ? 1 : -1),
                'deviation_rad': normalize_direction_rad(given_position_and_pose.direction_rad - nearest_position_and_pose.direction_rad , -Math.PI),
            };
        }
    }
}

export { PlaneWorldPositionAndPose , PlaneWorldArc };
