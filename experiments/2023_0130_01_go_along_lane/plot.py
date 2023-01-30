
import json
import matplotlib.pyplot as plt


def load_json_file(filepath):
    f = open(filepath, 'r')
    json_obj = json.loads(f.read())
    f.close()
    return json_obj


# data_name, mileage_range, lanes_range = '2023_0130_1419_k=1.0', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '2023_0130_1439_k=1.5', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '2023_0130_1447_k=0.5', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '2023_0130_1454_k=0.25', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '2023_0130_1511_k=0.20', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '2023_0130_1515_k=0.15', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '2023_0130_1518_k=0.10', (0, 700), (0, 3)

# segments = [
#     (200, +1), (320, +1), (440, +1), (560, +1), (680, -2),
#     (1200, +1), (1320, +1), (1440, +1), (1560, +1), (1680, -2),
#     (2000, 0),
# ]
# fig_size = (64, 16)
# data_name, mileage_range, lanes_range = '../2023_0130_02/2023_0130_2111', (0, 2000), (0, 11)
# data_name, mileage_range, lanes_range = '../2023_0130_02/2023_0130_2133', (0, 2000), (-0.1, 11.1)
# data_name, mileage_range, lanes_range = '../2023_0130_02/2023_0130_2341', (0, 2000), (-0.1, 11.1)
# data_name, mileage_range, lanes_range = '../2023_0130_02/2023_0130_2349', (0, 2000), (-0.1, 11.1)

# data_name, mileage_range, lanes_range = '', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '', (0, 700), (0, 3)

data = load_json_file(data_name+'.json')

plt.figure(figsize=fig_size)
plt.title(data_name)

plt.xlim(mileage_range)
plt.ylim(lanes_range)
plt.gca().invert_yaxis()

histories = data
for agent_id, track_history in histories.items():
    plt.plot(track_history['mileage'], track_history['lane'])

# for lane in range(lanes_range[0], lanes_range[1]+1):
#     plt.plot([mileage_range[0], mileage_range[1]], [lane, lane], linestyle='-.', color='#cccccc')
current_mileage = 0
current_lanes_cnt = 5
for segment in segments:
    for lane in range(0, current_lanes_cnt+1):
        plt.plot([current_mileage, segment[0]], [lane, lane], linestyle='-.', color='#cccccc')
    plt.plot([segment[0], segment[0]], [current_lanes_cnt, current_lanes_cnt+segment[1]], linestyle='-.', color='#cccccc')
    current_mileage = segment[0]
    current_lanes_cnt += segment[1]


plt.savefig(data_name+'.svg')
# plt.show()
