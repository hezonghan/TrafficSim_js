
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

class SimpleRoadEnvironment {

}

export { Environment };
