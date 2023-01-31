
import { range_binary_search } from './lib.js';

class Environment {

    constructor(road) {
        this.road = road;
        this.agents_generator = null;

        this.agents = {};
        this.agents_cnt = 0;
        this.t = 0;
    }

    connect(agents_generator) {
        this.agents_generator = agents_generator;
        agents_generator.environment = this;
    }

    run(interval) {
        this.agents_generator.run();
        this.recalculate_cache();
        for(var agent_id in this.agents) this.agents[agent_id].decide(interval);
        for(var agent_id in this.agents) this.agents[agent_id].execute(interval);
        this.print();
        this.t += interval;
    }

    delete_inactive_agents() {
        for(var agent_id in this.agents) if(! this.agents[agent_id].active) delete this.agents[agent_id];
    }

    print() {}

    recalculate_cache() {}

}

class SimpleRoadEnvironment extends Environment {

    // based on PlaneWorldSimpleRoad

    constructor(road) {
        super(road);

        this.sorted_agents = null;
        // this.agent_relative_pos = null;
    }

    recalculate_cache() {
        this.sorted_agents = [];
        for(var agent_id in this.agents) this.sorted_agents.push(agent_id);
        const that = this;
        this.sorted_agents.sort(function(agent_1_id , agent_2_id) {
            return  that.agents[agent_1_id].position_and_pose.mileage - 
                    that.agents[agent_2_id].position_and_pose.mileage;
        });

        // this.agent_relative_pos = {};
        // for(var pos=0 ; pos < this.sorted_agents.length ; pos += 1) {
        //     var agent_id = this.sorted_agents[pos];
        //     this.agent_relative_pos[agent_id] = pos;
        // }
    }

    // calculate_agent_relative_pos(mileage) 

    calculate_nearby_agents(mileage_lo , mileage_hi) {
        // Note: User needs to guatanteed that  recalculate_cache()  has been invoked based on up-to-date agents states.

        // console.log(this.agents);
        const that = this;
        return range_binary_search(this.sorted_agents , mileage_lo , mileage_hi , (agent_id)=>that.agents[agent_id].position_and_pose.mileage);
    }

}

export { Environment , SimpleRoadEnvironment };
