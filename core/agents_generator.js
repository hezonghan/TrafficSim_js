
import { sample } from './lib.js';

import { InteractiveAgent } from './agent.js';

class SimpleAgentsGenerator {

    // constructor(road , lane_safety_interval=5 , p=0.03) {
    // constructor(road , lane_safety_interval=2.5 , p=0.3) {
    // constructor(road , lane_safety_interval=1.5 , p=0.5) {
    constructor(road , lane_safety_interval=6 , p=0.3) {
        this.road = road;
        this.environment = null;
        
        this.lane_safety_interval = lane_safety_interval;
        this.p = p;

        this.entries_last_occupied = []
        for(var entry_idx = 0 ; entry_idx < this.road.entries.length ; entry_idx += 1) this.entries_last_occupied.push(0);
    }

    run() {
        var current_idle_entries = [];
        for(var entry_idx = 0 ; entry_idx < this.road.entries.length ; entry_idx += 1) {
            if(this.environment.t - this.entries_last_occupied[entry_idx] >= this.lane_safety_interval) {
                current_idle_entries.push(entry_idx);
            }
        }

        // var old_agents_cnt = Object.keys(this.environment.agents).length;  // inactive agents will be deleted from the map.
        var old_agents_cnt = this.environment.agents_cnt;
        
        // if(old_agents_cnt > 10) return;

        var new_agents_cnt = 0;
        while(new_agents_cnt < current_idle_entries.length && Math.random() < this.p) new_agents_cnt += 1;
        if(new_agents_cnt == 0) return;

        var new_agents_entries = sample(current_idle_entries , new_agents_cnt);

        for(var new_agent_idx = 0 ; new_agent_idx < new_agents_cnt ; new_agent_idx += 1) {
            var new_agent_id = old_agents_cnt + new_agent_idx;

            var initial_entry = new_agents_entries[new_agent_idx];
            var initial_destination = Math.floor(this.road.destinations.length * Math.random());

            var initial_position_and_pose = this.road.entries[initial_entry].position_and_pose.ahead(0);
            var initial_speed = (80 + Math.random() * (120-80)) / 3.6;

            this.environment.agents[new_agent_id] = new InteractiveAgent(
                new_agent_id,
                this.environment,
                initial_destination,
                initial_position_and_pose,
                initial_speed,
            );

            this.entries_last_occupied[initial_entry] = this.environment.t;
        }

        this.environment.agents_cnt = old_agents_cnt + new_agents_cnt;
    }
}

export { SimpleAgentsGenerator };
