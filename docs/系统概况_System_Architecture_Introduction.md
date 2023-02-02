

## 系统概况 System Architecture Introduction



### `core/`

实现与道路/车辆状态仿真相关的基础功能。
implements basic calculations of simulation on vehicles and roads.



- `geometry_lib_2d.js`: 平面几何计算库，提供 2D 位姿 `PlaneWorldPositionAndPose` 和 2D 圆弧 `PlaneWorldArc` 对象及其常用计算的封装。
  `geometry_lib_2d.js`: Library on 2D geometry, providing 2D position-and-pose `PlaneWorldPositionAndPose` and 2D arc `PlaneWorldArc`.

- `road.js`: 静态道路。当前仅实现：
  `road.js`: Static road. Currently implemented:

  - `Road`：基类 ，
    `Road`: the base class,
  - `PlaneWorldSimpleRoad`：平面内的高速公路模型（可更改曲率、增减车道、设置互通出入口）。
    `PlaneWorldSimpleRoad`: expressway in 2D plane (which supports changing curvature, adding or canceling lanes, and adding entries or exits).

- `agent.js`: 道路交通参与者。当前仅实现：
  `agent.js`: The participant of road traffic. Currently implemented:

  - `Agent`：基类，
    `Agent`: the base class,
  - `PlaneWorldAgent`：平面内行驶的小车（可根据所设置的行驶曲率与线加速度移动），
    `PlaneWorldAgent`: small vehicles which move within 2D plane (which can moves according to the assigned curvature and linear acceleration).
  - `PlaneWorldAimedAgent`：基于 `PlaneWorldSimpleRoad` 道路模型并可沿车道行驶的、有目标终点并可简单变道的、忽视其它交通参与者（因此线速度无需改变）、可识别与路侧发生碰撞的的小车，
    `PlaneWorldAimedAgent`: small vehicles that can go along a lane of the `PlaneWorldSimpleRoad` model, and have a destination and can simply switch lanes, but ignore other agents (so never control the linear acceleration), and can identify the collision with the side of road.
  - `InteractiveAgent`：在 `PlaneWorldAimedAgent` 基础上，简单考虑周围情况、简单控制线加速度、简单控制刹车灯与转向灯、可识别交通参与者之间发生碰撞的小车。
    `InteractiveAgent`: small vehicles which extend `PlaneWorldAimedAgent` but can simply observe nearby agents, simply control linear acceleration, simply gives turning signals and braking lights, and can identify the collision with another agent.

- `agents_generator.py`: 道路交通参与者生成器，按照一定的策略在特定时间、特定地点放置特定类型的道路交通参与者并给予特定的初始运动状态。当前仅实现：
  `agents_generator.py`: generator of agents. It generates agents of specific type at specific time, places them at specific positions, and gives them specific initial moving status, according to some strategy. Currently implemented:

  - `SimpleAgentsGenerator`：基于 `PlaneWorldSimpleRoad` 道路模型的生成器，可在道路入口处随机产生道路交通参与者。
    `SimpleAgentsGenerator`: Agents generator  that randomly places agents at the entries of `PlaneWorldSimpleRoad` model.

- `environment.py`：环境，对道路与道路交通参与者进行管理。
  `environment.py`: The environment that manages the road and agents.



### `frontend/`

将仿真结果进行 3D 显示。

provides 3D displaying.



### `experiments/`

一些（调参等）实验的代码与数据。

codes and results of some experiments.



