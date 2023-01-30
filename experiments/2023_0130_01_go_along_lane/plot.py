
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
data_name, mileage_range, lanes_range = '2023_0130_1518_k=0.10', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '', (0, 700), (0, 3)
# data_name, mileage_range, lanes_range = '', (0, 700), (0, 3)

data = load_json_file(data_name+'.json')

plt.figure()
plt.title(data_name)

plt.xlim(mileage_range)
plt.ylim(lanes_range)
plt.gca().invert_yaxis()

histories = data
for agent_id, track_history in histories.items():
    plt.plot(track_history['mileage'], track_history['lane'])

plt.savefig(data_name+'.svg')
# plt.show()
